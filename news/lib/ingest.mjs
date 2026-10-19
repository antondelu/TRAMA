// One ingestion run: fetch every enabled source, keep performing-arts news,
// merge it into the store without duplicates, prune by retention and record
// how each source did. A failing source is logged and skipped; whatever was
// stored before stays available.
import { parseFeed } from "./parse.mjs"
import { classify } from "./classify.mjs"
import { canonicalUrl, idFor, findSimilar } from "./dedupe.mjs"

export const USER_AGENT = "TRAMA-Noticias/1.0 (+https://github.com/antondelu/TRAMA)"
const MAX_FEED_BYTES = 5 * 1024 * 1024
const MAX_RUNS_KEPT = 30
const FUTURE_TOLERANCE_MS = 24 * 3600_000

async function readCapped(res) {
  const reader = res.body.getReader()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_FEED_BYTES) {
      await reader.cancel()
      throw new Error(`Feed larger than ${MAX_FEED_BYTES} bytes`)
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString("utf8")
}

// Fetches one feed. Sends the validators from the previous run so an
// unchanged feed answers 304 and costs nothing.
export async function fetchFeed(source, previous = {}, { fetchImpl = fetch, timeoutMs = 20_000 } = {}) {
  const headers = { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5" }
  if (previous.etag) headers["If-None-Match"] = previous.etag
  if (previous.lastModified) headers["If-Modified-Since"] = previous.lastModified
  const res = await fetchImpl(source.url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) })
  if (res.status === 304) return { notModified: true, etag: previous.etag, lastModified: previous.lastModified }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = await readCapped(res)
  return { items: parseFeed(xml, source.url, { bodyImages: source.bodyImages !== false }), etag: res.headers.get("etag"), lastModified: res.headers.get("last-modified") }
}

// fetch() reports network problems as a bare "fetch failed"; the useful part
// (DNS, refused connection, TLS, timeout) is in its cause.
function describeError(error) {
  if (error?.name === "TimeoutError") return "Timeout"
  const cause = error?.cause
  const detail = cause?.code ?? cause?.message
  return detail ? `${error.message}: ${detail}` : String(error?.message ?? error)
}

// Runs `fn` over `list` with at most `limit` calls in flight.
async function mapLimit(list, limit, fn) {
  const results = new Array(list.length)
  let next = 0
  const worker = async () => {
    while (next < list.length) {
      const i = next++
      results[i] = await fn(list[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker))
  return results
}

// Merges one source's parsed items into `data`. Returns counts for the run log.
export function mergeItems(data, source, parsed, now, retentionDays = Infinity) {
  const counts = { added: 0, updated: 0, duplicates: 0, skipped: 0 }
  const byId = new Map(data.items.map((it) => [it.id, it]))
  const nowMs = Date.parse(now)
  const oldestMs = nowMs - retentionDays * 24 * 3600_000
  // A general feed can be narrowed to the sections that matter (e.g. /cultura/).
  const linkPattern = source.linkPattern ? new RegExp(source.linkPattern) : null

  for (const raw of parsed) {
    if (linkPattern && !linkPattern.test(raw.url)) { counts.skipped++; continue }
    // No date means no reliable order: the item is dropped rather than given an invented one.
    // Search feeds also return old articles: those outside retention are not stored.
    const publishedMs = raw.publishedAt ? Date.parse(raw.publishedAt) : NaN
    if (!(publishedMs <= nowMs + FUTURE_TOLERANCE_MS && publishedMs >= oldestMs)) { counts.skipped++; continue }
    let canonical
    try { canonical = canonicalUrl(raw.url) } catch { counts.skipped++; continue }
    const verdict = classify(raw, source)
    if (!verdict.keep) { counts.skipped++; continue }

    const id = data.aliases[canonical] ?? idFor(canonical)
    const fields = {
      title: raw.title,
      summary: raw.summary,
      url: raw.url,
      image: raw.image,
      publishedAt: raw.publishedAt,
      sourceId: source.outlet ?? source.id,
      section: verdict.section,
      country: verdict.country,
      department: verdict.department,
      city: verdict.city,
      area: verdict.area,
      disciplines: verdict.disciplines,
    }

    const existing = byId.get(id)
    if (existing) {
      // Same story from the same address: update it if the source changed it.
      const changed = Object.keys(fields).some((k) => JSON.stringify(existing[k]) !== JSON.stringify(fields[k]))
      if (changed && existing.sourceId === fields.sourceId) {
        Object.assign(existing, fields, { updatedAt: now })
        counts.updated++
      } else if (existing.sourceId !== fields.sourceId) counts.duplicates++
      continue
    }

    const similar = findSimilar(data.items, fields)
    if (similar) {
      // Another address for a story already stored: remember the alias so a
      // later run recognises it at once, and keep the first version.
      data.aliases[canonical] = similar.id
      counts.duplicates++
      continue
    }

    const item = { id, canonicalUrl: canonical, ...fields, firstSeenAt: now, updatedAt: now }
    data.items.push(item)
    byId.set(id, item)
    counts.added++
  }
  return counts
}

// Drops items published before the retention window, and aliases that point
// to items no longer stored.
export function prune(data, retentionDays, now) {
  const cutoff = Date.parse(now) - retentionDays * 24 * 3600_000
  const before = data.items.length
  data.items = data.items.filter((it) => Date.parse(it.publishedAt) >= cutoff)
  const ids = new Set(data.items.map((it) => it.id))
  for (const [alias, id] of Object.entries(data.aliases)) if (!ids.has(id)) delete data.aliases[alias]
  return before - data.items.length
}

export async function runIngest({ store, sources, retentionDays = 180, concurrency = 4, fetchImpl, now = () => new Date(), log = () => {} }) {
  const release = store.acquireLock()
  if (!release) {
    log("ingest: another run is in progress, skipping")
    return { skipped: true }
  }
  try {
    const startedAt = now().toISOString()
    const data = store.load()
    data.lastRunAt = startedAt
    const enabled = sources.filter((s) => s.enabled !== false)

    // Fetch in parallel; merge one source at a time so de-duplication sees a
    // consistent list.
    const fetched = await mapLimit(enabled, concurrency, async (source) => {
      try {
        return { source, result: await fetchFeed(source, data.sources[source.id], { fetchImpl }) }
      } catch (error) {
        return { source, error }
      }
    })

    const report = []
    for (const { source, result, error } of fetched) {
      const state = data.sources[source.id] ?? {}
      state.lastAttemptAt = startedAt
      if (error) {
        state.lastError = { at: startedAt, message: describeError(error).slice(0, 300) }
        state.consecutiveFailures = (state.consecutiveFailures ?? 0) + 1
        report.push({ sourceId: source.id, ok: false, error: state.lastError.message })
        log(`ingest: ${source.id} failed: ${state.lastError.message}`)
      } else {
        const counts = result.notModified ? { added: 0, updated: 0, duplicates: 0, skipped: 0, notModified: true } : mergeItems(data, source, result.items, startedAt, retentionDays)
        Object.assign(state, { lastSuccessAt: startedAt, lastError: null, consecutiveFailures: 0, etag: result.etag ?? null, lastModified: result.lastModified ?? null })
        report.push({ sourceId: source.id, ok: true, ...counts })
      }
      data.sources[source.id] = state
    }

    const pruned = prune(data, retentionDays, startedAt)
    const okCount = report.filter((r) => r.ok).length
    const status = okCount === report.length ? "ok" : okCount ? "partial" : "failed"
    if (okCount) data.lastSuccessAt = startedAt
    const run = { startedAt, finishedAt: now().toISOString(), status, pruned, sources: report }
    data.runs = [run, ...data.runs].slice(0, MAX_RUNS_KEPT)
    store.save(data)
    log(`ingest: ${status}, ${report.reduce((n, r) => n + (r.added ?? 0), 0)} new, ${pruned} pruned, ${report.length - okCount} sources failed`)
    return run
  } finally {
    release()
  }
}
