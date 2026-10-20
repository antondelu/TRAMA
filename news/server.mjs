// Performing-arts news service. Serves GET /api/news from what is stored on
// disk and, when NEWS_SCHEDULER=on, refreshes it from the sources in
// sources.json every NEWS_INTERVAL_HOURS. Only reachable through nginx on the
// internal Docker network (no published port).
import http from "node:http"
import { config, loadSources } from "./lib/config.mjs"
import { createStore } from "./lib/store.mjs"
import { runIngest } from "./lib/ingest.mjs"
import { startScheduler, nextRunAt } from "./lib/scheduler.mjs"
import { queryNews, newsStatus } from "./lib/query.mjs"

const sources = loadSources()
const store = createStore(config.dataDir)
const log = (msg) => console.log(`${new Date().toISOString()} ${msg}`)

// The stored document is re-read only when it changes on disk.
let cache = { mtimeMs: null, data: null }
function cached() {
  const mtimeMs = store.mtimeMs()
  if (!cache.data || mtimeMs !== cache.mtimeMs) cache = { mtimeMs, data: store.load() }
  return cache.data
}

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": status === 200 ? "public, max-age=300" : "no-store" })
  res.end(JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost")
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "method_not_allowed" })
  try {
    if (url.pathname === "/healthz") return send(res, 200, { ok: true })
    if (url.pathname === "/api/news") {
      const data = cached()
      // Without the scheduler (local dev) nothing refreshes on its own: no countdown.
      const next = config.scheduler ? nextRunAt(data.lastRunAt, config.intervalHours) : null
      return send(res, 200, { ...queryNews(data, sources, Object.fromEntries(url.searchParams)), nextRunAt: next })
    }
    // Not routed by nginx: for operators, from inside the Docker network.
    if (url.pathname === "/status") return send(res, 200, newsStatus(cached(), sources))
    return send(res, 404, { error: "not_found" })
  } catch (err) {
    log(`request failed: ${err.stack ?? err}`)
    return send(res, 500, { error: "internal" })
  }
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") log(`news: port ${config.port} is already in use (is another copy of the service, or another npm start, running?)`)
  else log(`news: server error: ${err.stack ?? err}`)
  process.exit(1)
})

server.listen(config.port, () => {
  log(`news: listening on :${config.port}, ${sources.length} sources, scheduler ${config.scheduler ? `every ${config.intervalHours} h` : "off"}`)
  if (config.scheduler) {
    startScheduler({
      store,
      intervalHours: config.intervalHours,
      log,
      run: () => runIngest({ store, sources, retentionDays: config.retentionDays, log }),
    })
  }
})
