// Contact-form backend: receives POST /api/contact from the site and emails
// it to MAIL_TO over SMTP. Only reachable through nginx on the internal
// Docker network (no published port); nginx also rate-limits this route.
// GET /api/challenge hands out a small "pick the largest number" check that
// POST /api/contact must answer (see the challenge section below).
import http from "node:http"
import crypto from "node:crypto"
import fs from "node:fs"
import nodemailer from "nodemailer"

// Local dev convenience: read api/.env if present (simple KEY=value lines;
// real environment variables win). In Docker the variables come from
// compose's env_file and no .env is in the image.
try {
  for (const line of fs.readFileSync(new URL(".env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m || m[1] in process.env) continue
    process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2")
  }
} catch {}

const env = (name, fallback) => {
  const v = process.env[name] ?? fallback
  if (v === undefined || v === "") throw new Error(`Missing required env var ${name}`)
  return v
}

const PORT = Number(process.env.PORT ?? 3000)
const MAIL_TO = process.env.MAIL_TO
const MAIL_FROM = process.env.MAIL_FROM
const SMTP_PORT = Number(env("SMTP_PORT", "587"))

// Without SMTP settings the API still starts (so the form and its challenge
// work, e.g. in local dev), but every send answers 503 until they're set.
const transport = !process.env.SMTP_HOST || !MAIL_FROM || !MAIL_TO ? null : nodemailer.createTransport({
  host: env("SMTP_HOST"),
  port: SMTP_PORT,
  // 465 = implicit TLS; any other port upgrades with STARTTLS, which is required.
  secure: SMTP_PORT === 465,
  requireTLS: SMTP_PORT !== 465,
  auth: process.env.SMTP_USER ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") } : undefined,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
})

const MAX_BODY = 16 * 1024
const LIMITS = { name: 100, email: 254, company: 150, msg: 5000 }
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const LANGS = new Set(["es", "en", "pt"])

// --- Challenge ("which number is largest?") ---------------------------------
// Stateless: the numbers travel in a token signed with CHALLENGE_SECRET, so
// the client can't forge or alter them. Each token is single-use, expires
// after CHALLENGE_TTL, and is rejected if answered faster than a person could.
// Without CHALLENGE_SECRET a random one is used, which only means challenges
// handed out before a restart stop being valid.
const CHALLENGE_SECRET = process.env.CHALLENGE_SECRET || crypto.randomBytes(32).toString("hex")
const CHALLENGE_TTL = 10 * 60_000
const CHALLENGE_MIN_AGE = 2_000
const usedChallenges = new Map() // id -> expiry, pruned as they expire

const sign = (payload) => crypto.createHmac("sha256", CHALLENGE_SECRET).update(payload).digest("base64url")

function newChallenge() {
  const nums = new Set()
  while (nums.size < 3) nums.add(crypto.randomInt(10, 100))
  const payload = Buffer.from(JSON.stringify({ n: [...nums], t: Date.now(), id: crypto.randomUUID() })).toString("base64url")
  return { numbers: [...nums], token: `${payload}.${sign(payload)}` }
}

function checkChallenge(token, answer) {
  if (typeof token !== "string" || token.length > 512) return false
  const [payload, mac] = token.split(".")
  if (!payload || !mac) return false
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(mac)
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false
  let data
  try { data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) } catch { return false }
  const age = Date.now() - data.t
  if (!(age >= CHALLENGE_MIN_AGE && age <= CHALLENGE_TTL) || usedChallenges.has(data.id)) return false
  // Burn the token whether or not the answer is right: one guess per challenge.
  usedChallenges.set(data.id, data.t + CHALLENGE_TTL)
  return Number(answer) === Math.max(...data.n)
}

setInterval(() => {
  const now = Date.now()
  for (const [id, exp] of usedChallenges) if (exp < now) usedChallenges.delete(id)
}, 60_000).unref()

// Single-line fields end up in the subject/Reply-To, so strip anything that
// could break the header or the layout.
const oneLine = (s) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim()

function validate(body) {
  if (typeof body !== "object" || body === null) return null
  const str = (k) => (typeof body[k] === "string" ? body[k] : "")
  const data = {
    name: oneLine(str("name")),
    email: oneLine(str("email")),
    company: oneLine(str("company")),
    msg: str("msg").replace(/\r\n?/g, "\n").trim(),
  }
  for (const [k, max] of Object.entries(LIMITS)) if (data[k].length > max) return null
  if (!data.name || !data.msg || !EMAIL_RE.test(data.email)) return null
  data.lang = LANGS.has(body.lang) ? body.lang : "es"
  return data
}

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" })
  res.end(JSON.stringify(payload))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on("data", (c) => {
      size += c.length
      if (size <= MAX_BODY) return chunks.push(c)
      // Discard the rest instead of destroying the socket, so the 413 still
      // reaches the client; send() closes the connection afterwards.
      req.removeAllListeners("data")
      req.resume()
      reject(Object.assign(new Error("too large"), { status: 413 }))
    })
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))) }
      catch { reject(Object.assign(new Error("bad json"), { status: 400 })) }
    })
    req.on("error", reject)
  })
}

async function handleContact(req, res) {
  if (!(req.headers["content-type"] ?? "").startsWith("application/json")) return send(res, 415, { ok: false })
  let body
  try { body = await readJson(req) } catch (e) {
    if (e.status === 413) res.setHeader("Connection", "close")
    return send(res, e.status ?? 400, { ok: false })
  }

  // Honeypot: the "website" field is hidden from people, so only bots fill it.
  // Answer as if it worked so they don't retry.
  if (typeof body?.website === "string" && body.website !== "") return send(res, 200, { ok: true })

  const data = validate(body)
  if (!data) return send(res, 422, { ok: false })
  if (!checkChallenge(body.challenge, body.answer)) return send(res, 422, { ok: false, error: "challenge" })

  const ip = req.headers["x-real-ip"] ?? req.socket.remoteAddress
  if (!transport) {
    console.error("contact: not sent — SMTP_HOST/MAIL_FROM/MAIL_TO are not configured (see api/.env.example)")
    return send(res, 503, { ok: false })
  }
  const text = [
    `Nombre:  ${data.name}`,
    `Email:   ${data.email}`,
    `Organización: ${data.company || "-"}`,
    `Idioma:  ${data.lang}`,
    "",
    data.msg,
    "",
    "--",
    `Enviado desde el formulario de ${req.headers["x-forwarded-host"] ?? "TRAMA"} (IP ${ip}).`,
  ].join("\n")

  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: { name: data.name, address: data.email },
      subject: `TRAMA - nuevo contacto: ${data.name}${data.company ? ` (${data.company})` : ""}`,
      text,
    })
    console.log(`contact: sent (ip ${ip})`)
    send(res, 200, { ok: true })
  } catch (e) {
    console.error(`contact: SMTP error: ${e.message}`)
    send(res, 502, { ok: false })
  }
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost")
  if (pathname === "/healthz" && req.method === "GET") return send(res, 200, { ok: true })
  if (pathname === "/api/challenge") {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { ok: false }) }
    return send(res, 200, newChallenge())
  }
  if (pathname === "/api/contact") {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { ok: false }) }
    return handleContact(req, res).catch((e) => { console.error(e); send(res, 500, { ok: false }) })
  }
  send(res, 404, { ok: false })
})
server.requestTimeout = 15_000
server.headersTimeout = 10_000
server.listen(PORT, () => {
  console.log(`contact api listening on :${PORT}`)
  if (!transport) console.warn("WARNING: SMTP_HOST/MAIL_FROM/MAIL_TO not set — messages will NOT be sent (see api/.env.example)")
})

for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => server.close(() => process.exit(0)))
