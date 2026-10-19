// Settings from environment variables, and the source registry (sources.json).
import fs from "node:fs"
import { COUNTRIES, DEPARTMENTS } from "./geo.mjs"

// Local dev convenience, same as api/server.mjs: read news/.env if present
// (simple KEY=value lines; real environment variables win).
try {
  for (const line of fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m || m[1] in process.env) continue
    process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2")
  }
} catch {}

const number = (name, fallback, min) => {
  const v = Number(process.env[name] ?? fallback)
  if (!Number.isFinite(v) || v < min) throw new Error(`${name} must be a number >= ${min}`)
  return v
}

export const config = {
  port: number("PORT", 3000, 1),
  dataDir: process.env.NEWS_DATA_DIR || new URL("../data", import.meta.url).pathname,
  sourcesFile: process.env.NEWS_SOURCES_FILE || new URL("../sources.json", import.meta.url).pathname,
  intervalHours: number("NEWS_INTERVAL_HOURS", 12, 1),
  retentionDays: number("NEWS_RETENTION_DAYS", 180, 1),
  // Off by default in tests and local dev; the Docker image turns it on.
  scheduler: process.env.NEWS_SCHEDULER === "on",
}

const DEPARTMENT_NAMES = new Set(DEPARTMENTS.map((d) => d.name))
const ID_RE = /^[a-z0-9][a-z0-9-]{0,60}$/

// Validates the registry up front so a typo fails loudly at start-up instead
// of silently misplacing news.
export function loadSources(file = config.sourcesFile) {
  const { sources } = JSON.parse(fs.readFileSync(file, "utf8"))
  if (!Array.isArray(sources)) throw new Error(`${file}: "sources" must be an array`)
  const ids = new Set()
  for (const s of sources) {
    const where = `${file}: source ${JSON.stringify(s.id)}`
    if (!ID_RE.test(s.id ?? "")) throw new Error(`${where}: id must be lowercase letters, digits and dashes`)
    if (ids.has(s.id)) throw new Error(`${where}: duplicate id`)
    ids.add(s.id)
    if (!s.name) throw new Error(`${where}: name is required`)
    if (!/^https?:\/\//.test(s.url ?? "")) throw new Error(`${where}: url must be http(s)`)
    if (!COUNTRIES[s.country]) throw new Error(`${where}: unknown country ${s.country}`)
    if (s.department && (s.country !== "UY" || !DEPARTMENT_NAMES.has(s.department))) throw new Error(`${where}: unknown department ${s.department}`)
    if (s.linkPattern) {
      try { new RegExp(s.linkPattern) } catch { throw new Error(`${where}: linkPattern is not a valid regular expression`) }
    }
    if (s.wordpressSearch && !(Array.isArray(s.wordpressSearch) && s.wordpressSearch.every((t) => /^[\p{L} ]{3,30}$/u.test(t)))) {
      throw new Error(`${where}: wordpressSearch must be a list of search words`)
    }
  }
  return sources.flatMap(expandSearchFeeds)
}

// A WordPress site publishes a feed for any search (/?s=teatro&feed=rss2).
// Each term becomes one more feed of the same outlet: its items are credited
// to the outlet, while fetch status is tracked per feed.
function expandSearchFeeds(source) {
  const { wordpressSearch = [], ...base } = source
  const origin = new URL(source.url).origin
  return [base, ...wordpressSearch.map((term) => ({
    ...base,
    id: `${source.id}--${term.replace(/ /g, "-")}`,
    outlet: source.id,
    url: `${origin}/?s=${encodeURIComponent(term)}&feed=rss2`,
    linkPattern: undefined,
  }))]
}
