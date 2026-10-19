// Duplicate detection: the same story is recognised by its canonical URL
// (tracking parameters, "amp" variants and trailing slashes removed) or by a
// near-identical title published within a few days.
import crypto from "node:crypto"
import { fold } from "./text.mjs"

const TRACKING = /^(utm_\w+|fbclid|gclid|dclid|mc_cid|mc_eid|igshid|ref|ref_src|cmpid|ito|outputType|output|amp)$/i

export function canonicalUrl(raw) {
  const u = new URL(raw)
  u.protocol = "https:"
  u.hostname = u.hostname.toLowerCase().replace(/^(www|m|amp)\./, "")
  u.hash = ""
  for (const key of [...u.searchParams.keys()]) if (TRACKING.test(key)) u.searchParams.delete(key)
  u.searchParams.sort()
  u.pathname = u.pathname.replace(/\/amp\/?$/, "/").replace(/\/+$/, "") || "/"
  return u.href
}

export const idFor = (canonical) => crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 20)

// Word bigrams of the folded title, without punctuation or very short words.
function bigrams(title) {
  const words = fold(title).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2)
  const grams = new Set()
  for (let i = 0; i < words.length - 1; i++) grams.add(`${words[i]} ${words[i + 1]}`)
  if (words.length === 1) grams.add(words[0])
  return grams
}

// Dice coefficient over word bigrams: 1 = same words in the same order.
export function titleSimilarity(a, b) {
  const x = bigrams(a)
  const y = bigrams(b)
  if (!x.size || !y.size) return 0
  let shared = 0
  for (const g of x) if (y.has(g)) shared++
  return (2 * shared) / (x.size + y.size)
}

// Same words in another order ("Río Negro anunció el calendario del Carnaval
// 2027" / "Carnaval 2027: Río Negro anunció el calendario de actividades"):
// nearly all the meaningful words of the shorter title appear in the longer
// one, and they share several, so that short titles don't match by chance.
const STOPWORDS = new Set(["del", "las", "los", "para", "con", "una", "uno", "por", "que", "sus", "como", "the", "and", "for", "with"])
function words(title) {
  return new Set(fold(title).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)))
}
export function wordOverlap(a, b) {
  const x = words(a)
  const y = words(b)
  let shared = 0
  for (const w of x) if (y.has(w)) shared++
  return { shared, containment: Math.min(x.size, y.size) ? shared / Math.min(x.size, y.size) : 0 }
}

export const SIMILAR_TITLE = 0.8
const SIMILAR_WORDS = { containment: 0.85, shared: 5 }
const SIMILAR_WINDOW_MS = 3 * 24 * 3600_000

// An already stored item that tells the same story, or undefined.
export function findSimilar(items, candidate) {
  const at = Date.parse(candidate.publishedAt)
  return items.find((it) => Math.abs(Date.parse(it.publishedAt) - at) <= SIMILAR_WINDOW_MS
    && (titleSimilarity(it.title, candidate.title) >= SIMILAR_TITLE || sameWords(it.title, candidate.title)))
}

function sameWords(a, b) {
  const { shared, containment } = wordOverlap(a, b)
  return shared >= SIMILAR_WORDS.shared && containment >= SIMILAR_WORDS.containment
}
