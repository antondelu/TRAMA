// Runs one ingestion now and exits. For operators (docker compose exec news
// node ingest.mjs) and local dev; production refreshes on its own through
// the scheduler in server.mjs. The lock keeps it from overlapping a scheduled run.
import { config, loadSources } from "./lib/config.mjs"
import { createStore } from "./lib/store.mjs"
import { runIngest } from "./lib/ingest.mjs"

const run = await runIngest({
  store: createStore(config.dataDir),
  sources: loadSources(),
  retentionDays: config.retentionDays,
  log: (msg) => console.log(msg),
})
if (run.skipped) process.exit(0)
for (const s of run.sources) console.log(s.ok ? `  ok    ${s.sourceId}: +${s.added ?? 0} new, ${s.updated ?? 0} updated, ${s.duplicates ?? 0} duplicates` : `  FAIL  ${s.sourceId}: ${s.error}`)
process.exit(run.status === "failed" ? 1 : 0)
