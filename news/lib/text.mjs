// Text helpers shared by the parser, the classifier and the de-duplicator.

const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—",
  laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", iexcl: "¡", iquest: "¿",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  ccedil: "ç", atilde: "ã", otilde: "õ", acirc: "â", ecirc: "ê", ocirc: "ô", agrave: "à",
}

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : ""
    }
    return NAMED_ENTITIES[e] ?? m
  })
}

// Plain text from an HTML fragment: drops scripts/styles and tags, decodes
// entities and collapses whitespace. Feeds often double-encode, so decode
// before and after stripping tags.
export function toPlainText(value) {
  if (value == null) return ""
  let s = decodeEntities(String(value))
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<br\s*\/?>|<\/p>/gi, " ").replace(/<[^>]+>/g, " ")
  // NFKC turns "styled" Unicode letters (𝑭𝒊𝒆𝒔𝒕𝒂) into plain ones.
  return decodeEntities(s).normalize("NFKC").replace(/\s+/g, " ").trim()
}

// Short excerpt of the source's own text, cut at a word boundary. Never
// rewrites: the summary shown is always the publisher's words.
export function excerpt(text, max = 280) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = cut.lastIndexOf(" ")
  return `${cut.slice(0, end > max * 0.6 ? end : max).replace(/[\s,;:.—–-]+$/, "")}…`
}

// Lowercase without accents, for keyword matching and title comparison.
export function fold(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}
