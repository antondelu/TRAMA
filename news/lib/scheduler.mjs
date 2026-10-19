// Server-side schedule: runs the ingestion every `intervalHours`, whether or
// not anyone is browsing. The next run is computed from the last one stored
// on disk, so a restart neither skips a run nor fetches again too early.
const MAX_TIMEOUT_MS = 2 ** 31 - 1

export function nextDelayMs(lastRunAt, intervalHours, nowMs = Date.now()) {
  if (!lastRunAt) return 0
  const due = Date.parse(lastRunAt) + intervalHours * 3600_000
  return Math.min(MAX_TIMEOUT_MS, Math.max(0, due - nowMs))
}

export function startScheduler({ store, run, intervalHours, log = console.log }) {
  let timer = null
  let stopped = false

  const schedule = () => {
    if (stopped) return
    const delay = nextDelayMs(store.load().lastRunAt, intervalHours)
    log(`scheduler: next ingestion in ${Math.round(delay / 60_000)} min`)
    timer = setTimeout(tick, delay)
  }

  const tick = async () => {
    try {
      await run()
    } catch (err) {
      log(`scheduler: ingestion crashed: ${err.stack ?? err}`)
      // Without this, a crash before lastRunAt is saved would retry in a tight loop.
      timer = setTimeout(schedule, 15 * 60_000)
      return
    }
    schedule()
  }

  schedule()
  return () => { stopped = true; clearTimeout(timer) }
}
