// RSS 2.0 / Atom / RDF parser: turns a feed document into plain items
// { title, url, summary, image, publishedAt, updatedAt }. Only what the feed
// itself provides is used; nothing is fetched from the article pages.
import { XMLParser } from "fast-xml-parser"
import { toPlainText, excerpt } from "./text.mjs"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  processEntities: true,
  htmlEntities: true,
  parseTagValue: false,
  trimValues: true,
})

// "The post X appeared first on Y." / "La entrada X se publicó primero en Y."
const WORDPRESS_FOOTER = /\s*(The post .+ appeared first on .+|La entrada .+ se public[oó] primero en .+)$/

const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])
const text = (v) => {
  if (v == null) return ""
  if (typeof v === "object") return String(v["#text"] ?? "")
  return String(v)
}

function toDate(v) {
  const s = text(v).trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Only absolute http(s) URLs are kept; images must be https so the page
// never mixes insecure content.
export function safeUrl(v, base) {
  if (!v || !String(v).trim()) return null
  try {
    const u = new URL(String(v).trim(), base)
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null
  } catch {
    return null
  }
}
const safeImage = (v, base) => {
  const u = v && safeUrl(v, base)
  return u && u.startsWith("https:") ? u : null
}

function imageFrom(entry, html, base, bodyImages) {
  const candidates = [
    ...list(entry["media:content"]).filter((m) => !m["@medium"] || m["@medium"] === "image").map((m) => m["@url"]),
    ...list(entry["media:group"]).flatMap((g) => list(g["media:content"]).map((m) => m["@url"])),
    ...list(entry["media:thumbnail"]).map((m) => m["@url"]),
    ...list(entry.enclosure).filter((e) => String(e["@type"] ?? "").startsWith("image/")).map((e) => e["@url"]),
    ...list(entry.link).filter((l) => l["@rel"] === "enclosure" && String(l["@type"] ?? "").startsWith("image/")).map((l) => l["@href"]),
    bodyImages ? html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] : null,
  ]
  for (const c of candidates) {
    const u = safeImage(c, base)
    if (u) return u
  }
  return null
}

function atomLink(entry) {
  const links = list(entry.link)
  const alt = links.find((l) => typeof l === "object" && (!l["@rel"] || l["@rel"] === "alternate")) ?? links[0]
  return typeof alt === "object" ? alt["@href"] : alt
}

// bodyImages: false ignores <img> inside the text (for outlets that embed ads there).
export function parseFeed(xml, feedUrl, { bodyImages = true } = {}) {
  const doc = parser.parse(xml)
  const channel = doc.rss?.channel ?? doc["rdf:RDF"]?.channel
  const isAtom = !channel && doc.feed
  if (!channel && !isAtom) throw new Error("Not an RSS or Atom feed")
  const entries = isAtom ? list(doc.feed.entry) : list(channel.item ?? doc["rdf:RDF"]?.item)

  return entries.map((entry) => {
    const html = text(isAtom ? entry.summary ?? entry.content : entry.description ?? entry["content:encoded"])
    const url = safeUrl(isAtom ? atomLink(entry) : text(entry.link) || (entry.guid?.["@isPermaLink"] !== "false" ? text(entry.guid) : ""), feedUrl)
    return {
      title: toPlainText(text(entry.title)),
      url,
      summary: excerpt(toPlainText(html).replace(WORDPRESS_FOOTER, "").trim()),
      image: imageFrom(entry, html, url ?? feedUrl, bodyImages),
      publishedAt: toDate(isAtom ? entry.published ?? entry.updated : entry.pubDate ?? entry["dc:date"]),
      updatedAt: toDate(isAtom ? entry.updated : entry["atom:updated"]),
    }
  }).filter((it) => it.title && it.url)
}
