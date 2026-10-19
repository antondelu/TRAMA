// `npm start`: the site (Vite) and the news service together, in one terminal.
// The first time, it installs the news service's dependencies and fetches the
// news once; after that it only starts what's needed. In development the
// service doesn't refresh on its own: `cd news && npm run ingest` does it.
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"

const root = new URL("..", import.meta.url).pathname
const news = `${root}news/`
const children = []

const run = (cmd, args, opts = {}) => {
  const child = spawn(cmd, args, { cwd: root, stdio: "inherit", ...opts })
  children.push(child)
  return child
}

if (!fs.existsSync(`${news}node_modules`)) {
  console.log("noticias: instalando dependencias del servicio (solo la primera vez)…")
  const install = spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: news, stdio: "inherit" })
  if (install.status !== 0) process.exit(install.status ?? 1)
}

run(process.execPath, ["server.mjs"], { cwd: news, env: { ...process.env, PORT: "3001" } }).on("exit", (code) => {
  if (code) console.log("noticias: el servicio no pudo arrancar (ver el mensaje de arriba). La web sigue funcionando, pero /noticias va a mostrar un error.")
})

// No stored news yet: fetch them once in the background. The service picks
// them up as soon as they're saved, so the page fills in by itself.
if (!fs.existsSync(`${news}data/news.json`)) {
  console.log("noticias: trayendo las noticias por primera vez (puede tardar un minuto)…")
  run(process.execPath, ["ingest.mjs"], { cwd: news }).on("exit", (code) => {
    if (code === 0) console.log("noticias: listas, recargá /noticias en el navegador.")
  })
}

const vite = run(process.execPath, [`${root}node_modules/vite/bin/vite.js`])

const stop = () => {
  for (const child of children) if (child.exitCode === null) child.kill("SIGTERM")
}
process.on("SIGINT", stop)
process.on("SIGTERM", stop)
vite.on("exit", (code) => {
  stop()
  process.exit(code ?? 0)
})
