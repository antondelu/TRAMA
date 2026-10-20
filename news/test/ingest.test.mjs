import { test, beforeEach } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createStore } from "../lib/store.mjs"
import { runIngest, prune } from "../lib/ingest.mjs"
import { canonicalUrl, titleSimilarity, findSimilar } from "../lib/dedupe.mjs"
import { queryNews, prioritizeLatam } from "../lib/query.mjs"
import { nextDelayMs, nextRunAt } from "../lib/scheduler.mjs"
import { loadSources } from "../lib/config.mjs"

const NOW = new Date("2026-10-19T15:00:00Z")
let dir, store

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "trama-news-"))
  store = createStore(dir)
})

const rss = (items) => `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>${items.map((it) => `
  <item><title>${it.title}</title><link>${it.link}</link><description>${it.description ?? ""}</description>
  <pubDate>${it.date ?? "Mon, 19 Oct 2026 10:00:00 GMT"}</pubDate></item>`).join("")}</channel></rss>`

// A fake fetch serving fixed bodies per URL. A function value can throw or
// answer differently per call.
function fakeFetch(routes) {
  const calls = []
  const impl = async (url, init) => {
    calls.push({ url, headers: init.headers })
    const route = routes[url]
    const r = typeof route === "function" ? route(init) : route
    if (r instanceof Error) throw r
    if (typeof r === "number") return new Response(null, { status: r })
    return new Response(r.body, { status: 200, headers: r.headers ?? {} })
  }
  impl.calls = calls
  return impl
}

const SOURCES = [
  { id: "diaria", name: "la diaria", url: "https://diaria.example/feed", country: "UY" },
  { id: "telegrafo", name: "El Telégrafo", url: "https://telegrafo.example/feed", country: "UY", department: "Paysandú", city: "Paysandú" },
  { id: "pagina12", name: "Página/12", url: "https://p12.example/feed", country: "AR" },
]

const ingest = (fetchImpl, extra = {}) => runIngest({ store, sources: SOURCES, fetchImpl, now: () => NOW, ...extra })

test("canonical URLs ignore tracking parameters, amp, www and trailing slashes", () => {
  const a = canonicalUrl("http://www.Diaria.example/cultura/nota/?utm_source=rss&fbclid=x#top")
  const b = canonicalUrl("https://diaria.example/cultura/nota/amp/")
  assert.equal(a, "https://diaria.example/cultura/nota")
  assert.equal(a, b)
  assert.notEqual(canonicalUrl("https://diaria.example/nota?id=1"), canonicalUrl("https://diaria.example/nota?id=2"))
})

test("title similarity tolerates small edits but separates different stories", () => {
  assert.ok(titleSimilarity("El Galpón estrena Hamlet con dirección de Mario Ferreira", "El Galpón estrena «Hamlet» con dirección de Mario Ferreira") >= 0.8)
  assert.ok(titleSimilarity("El Galpón estrena Hamlet", "El Solís presenta su temporada de danza") < 0.3)
})

test("reordered titles of the same story are duplicates; short look-alikes are not", () => {
  const items = [{ id: "a", title: "RÍO NEGRO ANUNCIÓ EL CALENDARIO DEL CARNAVAL 2027", publishedAt: "2026-10-19T10:00:00Z" }]
  assert.equal(findSimilar(items, { title: "Carnaval 2027: Río Negro anunció el calendario de actividades para conocimiento de las agrupaciones", publishedAt: "2026-10-19T12:00:00Z" })?.id, "a")
  const short = [{ id: "b", title: "Estreno de teatro en Salto", publishedAt: "2026-10-19T10:00:00Z" }]
  assert.equal(findSimilar(short, { title: "Teatro en Salto: estreno infantil", publishedAt: "2026-10-19T10:00:00Z" }), undefined)
})

test("stores performing-arts news, classified by place, and drops the rest", async () => {
  const run = await ingest(fakeFetch({
    "https://diaria.example/feed": { body: rss([
      { title: "La Comedia Nacional estrena Las troyanas", link: "https://diaria.example/troyanas" },
      { title: "Suba del dólar", link: "https://diaria.example/dolar" },
    ]) },
    "https://telegrafo.example/feed": { body: rss([{ title: "Festival de teatro del litoral", link: "https://telegrafo.example/festival" }]) },
    "https://p12.example/feed": { body: rss([{ title: "Estreno de danza en Buenos Aires", link: "https://p12.example/danza" }]) },
  }))
  assert.equal(run.status, "ok")
  const data = store.load()
  assert.equal(data.items.length, 3)
  const telegrafo = data.items.find((it) => it.sourceId === "telegrafo")
  assert.equal(telegrafo.department, "Paysandú")
  assert.equal(telegrafo.area, "interior")
  assert.equal(data.items.find((it) => it.sourceId === "pagina12").section, "intl")
  assert.equal(data.lastSuccessAt, NOW.toISOString())
})

test("re-running does not duplicate, and updates an item the source changed", async () => {
  const feed = { body: rss([{ title: "Estreno de teatro en El Galpón", link: "https://diaria.example/galpon", description: "Primera versión" }]) }
  const routes = { "https://diaria.example/feed": feed, "https://telegrafo.example/feed": { body: rss([]) }, "https://p12.example/feed": { body: rss([]) } }
  await ingest(fakeFetch(routes))
  await ingest(fakeFetch(routes))
  assert.equal(store.load().items.length, 1)

  routes["https://diaria.example/feed"] = { body: rss([{ title: "Estreno de teatro en El Galpón", link: "https://diaria.example/galpon?utm_medium=rss", description: "Versión corregida" }]) }
  const run = await ingest(fakeFetch(routes))
  const [item] = store.load().items
  assert.equal(store.load().items.length, 1)
  assert.equal(item.summary, "Versión corregida")
  assert.equal(run.sources.find((s) => s.sourceId === "diaria").updated, 1)
})

test("the same story from two outlets is stored once", async () => {
  await ingest(fakeFetch({
    "https://diaria.example/feed": { body: rss([{ title: "Murga Agarrate Catalina anuncia su regreso al carnaval", link: "https://diaria.example/murga" }]) },
    "https://telegrafo.example/feed": { body: rss([{ title: "Murga Agarrate Catalina anuncia su regreso al Carnaval", link: "https://telegrafo.example/murga" }]) },
    "https://p12.example/feed": { body: rss([]) },
  }))
  const data = store.load()
  assert.equal(data.items.length, 1)
  assert.equal(data.items[0].sourceId, "diaria")
  assert.equal(Object.keys(data.aliases).length, 1)
})

test("a failing source is recorded and the rest, and stored news, survive", async () => {
  const ok = { body: rss([{ title: "Estreno de teatro", link: "https://diaria.example/a" }]) }
  await ingest(fakeFetch({ "https://diaria.example/feed": ok, "https://telegrafo.example/feed": { body: rss([{ title: "Obra de teatro en Paysandú", link: "https://telegrafo.example/a" }]) }, "https://p12.example/feed": { body: rss([]) } }))

  const run = await ingest(fakeFetch({
    "https://diaria.example/feed": ok,
    "https://telegrafo.example/feed": new Error("getaddrinfo ENOTFOUND"),
    "https://p12.example/feed": { body: "<html>not a feed</html>" },
  }))
  assert.equal(run.status, "partial")
  const data = store.load()
  assert.equal(data.items.length, 2, "items from the failing source are kept")
  assert.equal(data.sources.telegrafo.consecutiveFailures, 1)
  assert.match(data.sources.telegrafo.lastError.message, /ENOTFOUND/)
  assert.match(data.sources.pagina12.lastError.message, /Not an RSS or Atom feed/)
  assert.equal(data.sources.diaria.lastError, null)

  const allDown = await ingest(fakeFetch({ "https://diaria.example/feed": 503, "https://telegrafo.example/feed": 500, "https://p12.example/feed": 404 }))
  assert.equal(allDown.status, "failed")
  assert.equal(store.load().items.length, 2)
  assert.equal(store.load().lastSuccessAt, NOW.toISOString(), "last success is not overwritten by a failed run")
})

test("sends the previous validators and treats 304 as success", async () => {
  const routes = {
    "https://diaria.example/feed": { body: rss([]), headers: { etag: '"v1"' } },
    "https://telegrafo.example/feed": { body: rss([]) },
    "https://p12.example/feed": { body: rss([]) },
  }
  await ingest(fakeFetch(routes))
  routes["https://diaria.example/feed"] = (init) => (init.headers["If-None-Match"] === '"v1"' ? 304 : { body: rss([]) })
  const run = await ingest(fakeFetch(routes))
  assert.equal(run.sources.find((s) => s.sourceId === "diaria").notModified, true)
})

test("items without a date are dropped instead of getting an invented one", async () => {
  const xml = `<rss version="2.0"><channel><item><title>Estreno de teatro</title><link>https://diaria.example/x</link></item></channel></rss>`
  await ingest(fakeFetch({ "https://diaria.example/feed": { body: xml }, "https://telegrafo.example/feed": { body: rss([]) }, "https://p12.example/feed": { body: rss([]) } }))
  assert.equal(store.load().items.length, 0)
})

test("a second run while one holds the lock is skipped; a stale lock is taken over", async () => {
  const release = store.acquireLock()
  assert.deepEqual(await ingest(fakeFetch({})), { skipped: true })
  release()

  fs.writeFileSync(path.join(dir, "ingest.lock"), "{}")
  const old = new Date(Date.now() - 2 * 3600_000)
  fs.utimesSync(path.join(dir, "ingest.lock"), old, old)
  const run = await ingest(fakeFetch({ "https://diaria.example/feed": { body: rss([]) }, "https://telegrafo.example/feed": { body: rss([]) }, "https://p12.example/feed": { body: rss([]) } }))
  assert.equal(run.status, "ok")
  assert.equal(fs.existsSync(path.join(dir, "ingest.lock")), false, "lock released after the run")
})

test("retention drops old items and their aliases", () => {
  const data = { items: [
    { id: "new", publishedAt: "2026-10-01T00:00:00Z" },
    { id: "old", publishedAt: "2026-01-01T00:00:00Z" },
  ], aliases: { "https://x.example/a": "old", "https://x.example/b": "new" } }
  assert.equal(prune(data, 180, NOW.toISOString()), 1)
  assert.deepEqual(data.items.map((it) => it.id), ["new"])
  assert.deepEqual(Object.keys(data.aliases), ["https://x.example/b"])
})

test("query orders by date (Latin America first in the international block), filters and pages", () => {
  const base = { summary: "", url: "https://x.example", image: null, country: "UY", city: null }
  const data = { lastSuccessAt: NOW.toISOString(), lastRunAt: NOW.toISOString(), items: [
    { ...base, id: "a", title: "A", sourceId: "diaria", section: "uy", department: "Montevideo", area: "montevideo", disciplines: ["teatro"], publishedAt: "2026-10-17T00:00:00Z" },
    { ...base, id: "b", title: "B", sourceId: "telegrafo", section: "uy", department: "Paysandú", area: "interior", disciplines: ["danza"], publishedAt: "2026-10-19T00:00:00Z" },
    { ...base, id: "c", title: "C", sourceId: "telegrafo", section: "uy", department: "Salto", area: "interior", disciplines: ["teatro"], publishedAt: "2026-10-18T00:00:00Z" },
    { ...base, id: "d", title: "D", sourceId: "pagina12", section: "intl", country: "AR", department: null, area: "latam", disciplines: ["teatro"], publishedAt: "2026-10-19T00:00:00Z" },
  ] }
  const uy = queryNews(data, SOURCES, { section: "uy" })
  assert.deepEqual(uy.items.map((it) => it.id), ["b", "c", "a"])
  assert.equal(uy.items[0].source.name, "El Telégrafo")
  assert.deepEqual(queryNews(data, SOURCES, { section: "uy", location: "interior" }).items.map((it) => it.id), ["b", "c"])
  assert.deepEqual(queryNews(data, SOURCES, { section: "uy", location: "Salto" }).items.map((it) => it.id), ["c"])
  assert.deepEqual(queryNews(data, SOURCES, { section: "uy", discipline: "teatro" }).items.map((it) => it.id), ["c", "a"])
  const paged = queryNews(data, SOURCES, { section: "uy", pageSize: "2", page: "2" })
  assert.deepEqual(paged.items.map((it) => it.id), ["a"])
  assert.equal(paged.hasMore, false)
  assert.deepEqual(prioritizeLatam([
    { id: "w1", area: "world" }, { id: "w2", area: "world" }, { id: "l1", area: "latam" },
    { id: "l2", area: "latam" }, { id: "l3", area: "latam" }, { id: "w3", area: "world" },
  ]).map((it) => it.id), ["l1", "l2", "w1", "l3", "w2", "w3"])
  const intl = queryNews(data, SOURCES, { section: "intl" })
  assert.deepEqual(intl.items.map((it) => it.id), ["d"])
  assert.equal(intl.items[0].countryName, "Argentina")
  assert.deepEqual(intl.facets.locations.map((l) => l.id), ["latam", "AR"])
})

test("the schedule runs at once with no history and otherwise 12 h after the last run", () => {
  const now = Date.parse("2026-10-19T12:00:00Z")
  assert.equal(nextDelayMs(null, 12, now), 0)
  assert.equal(nextDelayMs("2026-10-19T06:00:00Z", 12, now), 6 * 3600_000)
  assert.equal(nextDelayMs("2026-10-18T00:00:00Z", 12, now), 0)
})

test("the next run is one interval after the last run, or now when it is overdue", () => {
  const now = Date.parse("2026-10-19T12:00:00Z")
  assert.equal(nextRunAt("2026-10-19T11:15:00Z", 1, now), "2026-10-19T12:15:00.000Z")
  assert.equal(nextRunAt("2026-10-19T09:00:00Z", 1, now), "2026-10-19T12:00:00.000Z")
  assert.equal(nextRunAt(null, 1, now), "2026-10-19T12:00:00.000Z")
})

test("the source registry is valid", () => {
  const sources = loadSources(new URL("../sources.json", import.meta.url).pathname)
  assert.ok(Array.isArray(sources))
})

test("the registry rejects unknown departments and duplicate ids", () => {
  const file = path.join(dir, "sources.json")
  fs.writeFileSync(file, JSON.stringify({ sources: [{ id: "a", name: "A", url: "https://a.example", country: "UY", department: "Narnia" }] }))
  assert.throws(() => loadSources(file), /unknown department/)
  fs.writeFileSync(file, JSON.stringify({ sources: [
    { id: "a", name: "A", url: "https://a.example", country: "UY" },
    { id: "a", name: "B", url: "https://b.example", country: "UY" },
  ] }))
  assert.throws(() => loadSources(file), /duplicate id/)
})
