// Persistent storage: one JSON document in NEWS_DATA_DIR (a Docker volume in
// production). Writes go to a temporary file that is then renamed over the
// old one, so a crash mid-write never leaves a half-written file. A lock file
// keeps two ingestions (two processes, or a retry) from running at once.
import fs from "node:fs"
import path from "node:path"

const EMPTY = () => ({ version: 1, items: [], aliases: {}, sources: {}, runs: [], lastRunAt: null, lastSuccessAt: null })

export function createStore(dir) {
  const file = path.join(dir, "news.json")
  const lockFile = path.join(dir, "ingest.lock")

  return {
    load() {
      try {
        return { ...EMPTY(), ...JSON.parse(fs.readFileSync(file, "utf8")) }
      } catch (err) {
        if (err.code === "ENOENT") return EMPTY()
        throw err
      }
    },

    // Modification time of the stored document (null if none yet), so readers
    // can skip re-parsing it when nothing changed.
    mtimeMs() {
      try {
        return fs.statSync(file).mtimeMs
      } catch {
        return null
      }
    },

    save(data) {
      fs.mkdirSync(dir, { recursive: true })
      const tmp = `${file}.${process.pid}.tmp`
      fs.writeFileSync(tmp, JSON.stringify(data))
      fs.renameSync(tmp, file)
    },

    // Returns a release function, or null if another ingestion holds the lock.
    // A lock older than `staleMs` is from a process that died and is taken over.
    acquireLock(staleMs = 30 * 60_000) {
      fs.mkdirSync(dir, { recursive: true })
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const fd = fs.openSync(lockFile, "wx")
          fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }))
          fs.closeSync(fd)
          return () => fs.rmSync(lockFile, { force: true })
        } catch (err) {
          if (err.code !== "EEXIST") throw err
          const age = Date.now() - fs.statSync(lockFile).mtimeMs
          if (age < staleMs) return null
          fs.rmSync(lockFile, { force: true })
        }
      }
      return null
    },
  }
}
