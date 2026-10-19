// Integration tests for the contact API: server.mjs runs as a child process
// (exactly as in production) and is exercised over HTTP. Mail goes to a local
// fake SMTP server, so nothing is ever sent for real.
import { test, describe, before, after } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import net from "node:net"
import { setTimeout as sleep } from "node:timers/promises"
import { SMTPServer } from "smtp-server"

// The API rejects answers given faster than this (CHALLENGE_MIN_AGE).
const MIN_CHALLENGE_AGE = 2_100

const freePort = () => new Promise((resolve, reject) => {
  const srv = net.createServer().listen(0, "127.0.0.1", () => {
    const { port } = srv.address()
    srv.close(() => resolve(port))
  }).on("error", reject)
})

// Starts server.mjs with the given SMTP settings. Every variable is set
// explicitly (empty when unused) so a developer's api/.env never leaks in.
async function startApi(smtp = {}) {
  const port = await freePort()
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: new URL(".", import.meta.url),
    env: {
      PATH: process.env.PATH,
      PORT: String(port),
      SMTP_HOST: "", SMTP_PORT: "587", SMTP_USER: "", SMTP_PASS: "",
      MAIL_FROM: "", MAIL_TO: "", CHALLENGE_SECRET: "test-secret",
      // The fake SMTP server uses a self-signed certificate for STARTTLS.
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      ...smtp,
    },
    stdio: ["ignore", "ignore", "pipe"],
  })
  let stderr = ""
  child.stderr.on("data", (c) => { stderr += c })
  const url = `http://127.0.0.1:${port}`
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${url}/healthz`)).ok) return { url, stop: () => child.kill() } } catch {}
    if (child.exitCode !== null) break
    await sleep(100)
  }
  child.kill()
  throw new Error(`API did not start:\n${stderr}`)
}

async function startSmtp() {
  const messages = []
  const server = new SMTPServer({
    authOptional: true,
    logger: false,
    onData(stream, session, done) {
      let raw = ""
      stream.on("data", (c) => { raw += c })
      stream.on("end", () => {
        messages.push({ raw, from: session.envelope.mailFrom.address, to: session.envelope.rcptTo.map((r) => r.address) })
        done()
      })
    },
  })
  const port = await freePort()
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve))
  return { port, messages, stop: () => new Promise((resolve) => server.close(resolve)) }
}

const getChallenge = async (url) => (await fetch(`${url}/api/challenge`)).json()

const postContact = (url, body, headers = { "Content-Type": "application/json" }) =>
  fetch(`${url}/api/contact`, { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) })

const validForm = { name: "Ana Pérez", email: "ana@example.com", company: "Sala Uno", msg: "Hola,\nquiero info.", lang: "es" }

// Challenges fetched up front and aged past MIN_CHALLENGE_AGE, so the tests
// that need an answerable one don't each wait two seconds.
async function agedChallenges(url, count) {
  const list = await Promise.all(Array.from({ length: count }, () => getChallenge(url)))
  await sleep(MIN_CHALLENGE_AGE)
  return list
}

const answer = (c) => ({ challenge: c.token, answer: Math.max(...c.numbers) })

describe("contact API with SMTP configured", () => {
  let smtp, api, challenges

  before(async () => {
    smtp = await startSmtp()
    api = await startApi({ SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.port), MAIL_FROM: "web@trama.test", MAIL_TO: "inbox@trama.test" })
    challenges = await agedChallenges(api.url, 4)
  })
  after(async () => {
    api?.stop()
    await smtp?.stop()
  })

  test("GET /healthz answers ok", async () => {
    const res = await fetch(`${api.url}/healthz`)
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { ok: true })
  })

  test("unknown paths answer 404", async () => {
    assert.equal((await fetch(`${api.url}/nope`)).status, 404)
  })

  test("GET /api/challenge hands out three distinct numbers and a signed token", async () => {
    const res = await fetch(`${api.url}/api/challenge`)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get("cache-control"), "no-store")
    const { numbers, token } = await res.json()
    assert.equal(numbers.length, 3)
    assert.equal(new Set(numbers).size, 3)
    assert.match(token, /^[\w-]+\.[\w-]+$/)
  })

  test("only GET is allowed on /api/challenge", async () => {
    const res = await fetch(`${api.url}/api/challenge`, { method: "POST" })
    assert.equal(res.status, 405)
    assert.equal(res.headers.get("allow"), "GET")
  })

  test("only POST is allowed on /api/contact", async () => {
    const res = await fetch(`${api.url}/api/contact`)
    assert.equal(res.status, 405)
    assert.equal(res.headers.get("allow"), "POST")
  })

  test("rejects a body that isn't JSON (415) or doesn't parse (400)", async () => {
    assert.equal((await postContact(api.url, "name=x", { "Content-Type": "application/x-www-form-urlencoded" })).status, 415)
    assert.equal((await postContact(api.url, "{not json")).status, 400)
  })

  test("rejects bodies over 16 KB with 413", async () => {
    const res = await postContact(api.url, { ...validForm, msg: "x".repeat(20_000) })
    assert.equal(res.status, 413)
  })

  test("rejects invalid fields with 422", async () => {
    for (const form of [
      { ...validForm, email: "not-an-email" },
      { ...validForm, name: "" },
      { ...validForm, msg: "   " },
      { ...validForm, company: "x".repeat(151) },
    ]) {
      assert.equal((await postContact(api.url, { ...form, challenge: "x.y", answer: 1 })).status, 422, JSON.stringify(form))
    }
  })

  test("pretends to accept honeypot submissions without sending mail", async () => {
    const sentBefore = smtp.messages.length
    const res = await postContact(api.url, { ...validForm, website: "http://spam.example" })
    assert.equal(res.status, 200)
    assert.equal(smtp.messages.length, sentBefore)
  })

  test("rejects a forged challenge token", async () => {
    const c = challenges.pop()
    const [payload] = c.token.split(".")
    const res = await postContact(api.url, { ...validForm, challenge: `${payload}.forged`, answer: Math.max(...c.numbers) })
    assert.equal(res.status, 422)
    assert.deepEqual(await res.json(), { ok: false, error: "challenge" })
  })

  test("rejects a challenge answered faster than a person could", async () => {
    const fresh = await getChallenge(api.url)
    const res = await postContact(api.url, { ...validForm, ...answer(fresh) })
    assert.equal(res.status, 422)
  })

  test("burns a challenge after a wrong answer", async () => {
    const c = challenges.pop()
    const wrong = await postContact(api.url, { ...validForm, challenge: c.token, answer: Math.min(...c.numbers) })
    assert.equal(wrong.status, 422)
    const retry = await postContact(api.url, { ...validForm, ...answer(c) })
    assert.equal(retry.status, 422)
  })

  test("sends the message to MAIL_TO and the token can't be reused", async () => {
    const c = challenges.pop()
    const sentBefore = smtp.messages.length
    const res = await postContact(api.url, { ...validForm, ...answer(c) })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { ok: true })
    assert.equal(smtp.messages.length, sentBefore + 1)

    const mail = smtp.messages.at(-1)
    assert.equal(mail.from, "web@trama.test")
    assert.deepEqual(mail.to, ["inbox@trama.test"])
    assert.match(mail.raw, /^Reply-To: .*ana@example\.com/m)
    assert.match(mail.raw, /quiero info\./)

    const replay = await postContact(api.url, { ...validForm, ...answer(c) })
    assert.equal(replay.status, 422)
  })

  test("strips line breaks from single-line fields (no header injection)", async () => {
    const c = challenges.pop()
    const res = await postContact(api.url, {
      ...validForm,
      name: "Ana\r\nBcc: victim@example.com",
      company: "Sala\nX-Injected: 1",
      ...answer(c),
    })
    assert.equal(res.status, 200)
    const mail = smtp.messages.at(-1)
    assert.deepEqual(mail.to, ["inbox@trama.test"])
    assert.doesNotMatch(mail.raw, /^Bcc:/im)
    assert.doesNotMatch(mail.raw, /^X-Injected:/im)
  })
})

describe("contact API without a working SMTP server", () => {
  test("answers 503 when SMTP isn't configured", async () => {
    const api = await startApi()
    try {
      const [c] = await agedChallenges(api.url, 1)
      const res = await postContact(api.url, { ...validForm, ...answer(c) })
      assert.equal(res.status, 503)
    } finally {
      api.stop()
    }
  })

  test("answers 502 when the SMTP server can't be reached", async () => {
    const api = await startApi({ SMTP_HOST: "127.0.0.1", SMTP_PORT: String(await freePort()), MAIL_FROM: "web@trama.test", MAIL_TO: "inbox@trama.test" })
    try {
      const [c] = await agedChallenges(api.url, 1)
      const res = await postContact(api.url, { ...validForm, ...answer(c) })
      assert.equal(res.status, 502)
    } finally {
      api.stop()
    }
  })
})
