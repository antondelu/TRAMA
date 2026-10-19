import { test } from "node:test"
import assert from "node:assert/strict"
import { parseFeed } from "../lib/parse.mjs"
import { classify, disciplinesOf, isListing, placeOf } from "../lib/classify.mjs"
import { findUruguayPlace } from "../lib/geo.mjs"
import { excerpt, toPlainText } from "../lib/text.mjs"

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel><title>Cultura</title>
  <item>
    <title>La Comedia Nacional estrena &quot;Las troyanas&quot;</title>
    <link>https://example.uy/cultura/troyanas?utm_source=rss</link>
    <description><![CDATA[<p>La obra se presenta en la Sala Verdi <b>desde el jueves</b>.</p>]]></description>
    <pubDate>Mon, 19 Oct 2026 10:00:00 -0300</pubDate>
    <media:content url="https://cdn.example.uy/troyanas.jpg" medium="image"/>
  </item>
  <item>
    <title>Sin enlace</title>
    <description>Se descarta</description>
  </item>
  <item>
    <title>Imagen insegura</title>
    <link>https://example.uy/b</link>
    <description>&lt;img src="http://insecure.example/x.jpg"&gt; Texto</description>
    <pubDate>Mon, 19 Oct 2026 09:00:00 -0300</pubDate>
  </item>
</channel></rss>`

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Stage</title>
  <entry>
    <title type="html">New production of &lt;i&gt;Hamlet&lt;/i&gt; opens</title>
    <link rel="alternate" href="https://stage.example/hamlet"/>
    <link rel="enclosure" type="image/jpeg" href="https://stage.example/h.jpg"/>
    <published>2026-10-18T12:00:00Z</published>
    <summary>The theatre company returns.</summary>
  </entry>
</feed>`

test("parses RSS items, keeps only items with title and link, and only https images", () => {
  const items = parseFeed(RSS, "https://example.uy/feed")
  assert.equal(items.length, 2)
  assert.equal(items[0].title, 'La Comedia Nacional estrena "Las troyanas"')
  assert.equal(items[0].summary, "La obra se presenta en la Sala Verdi desde el jueves .")
  assert.equal(items[0].image, "https://cdn.example.uy/troyanas.jpg")
  assert.equal(items[0].publishedAt, "2026-10-19T13:00:00.000Z")
  assert.equal(items[1].image, null)
})

test("parses Atom entries with alternate link and enclosure image", () => {
  const [item] = parseFeed(ATOM, "https://stage.example/feed")
  assert.equal(item.title, "New production of Hamlet opens")
  assert.equal(item.url, "https://stage.example/hamlet")
  assert.equal(item.image, "https://stage.example/h.jpg")
})

test("drops WordPress footers from summaries and can ignore images inside the text", () => {
  const xml = `<rss version="2.0"><channel><item><title>Obra</title><link>https://x.example/a</link>
    <description>&lt;img src="https://x.example/promo.jpg"&gt; Estreno el viernes. The post Obra appeared first on Diario X.</description>
    <pubDate>Mon, 19 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`
  const [withBody] = parseFeed(xml, "https://x.example/feed")
  assert.equal(withBody.summary, "Estreno el viernes.")
  assert.equal(withBody.image, "https://x.example/promo.jpg")
  assert.equal(parseFeed(xml, "https://x.example/feed", { bodyImages: false })[0].image, null)
})

test("rejects documents that are not feeds", () => {
  assert.throws(() => parseFeed("<html><body>hola</body></html>", "https://x.example"), /Not an RSS or Atom feed/)
})

test("excerpt cuts at a word boundary and never exceeds the limit", () => {
  const long = "palabra ".repeat(100).trim()
  const out = excerpt(long, 50)
  assert.ok(out.length <= 51)
  assert.ok(out.endsWith("palabra…"))
  assert.equal(toPlainText("Uno &amp;amp; dos<br>tres"), "Uno & dos tres")
  assert.equal(toPlainText("Cierre de la 𝑭𝒊𝒆𝒔𝒕𝒂"), "Cierre de la Fiesta")
})

test("detects disciplines and ignores non-stage uses of the words", () => {
  assert.deepEqual(disciplinesOf("Nuevo ballet en el Auditorio"), ["danza"])
  assert.ok(disciplinesOf("Murga Agarrate Catalina presenta su espectáculo").includes("carnaval"))
  assert.ok(disciplinesOf("Temporada de ópera en el Solís").includes("opera"))
  assert.deepEqual(disciplinesOf("La empresa opera en tres países"), [])
  assert.deepEqual(disciplinesOf("El teatro de operaciones se amplía en la frontera"), [])
  assert.deepEqual(disciplinesOf("Aumentan las exportaciones de carne"), [])
})

test("recognises performing-arts festivals and drops film, book and food festivals", () => {
  const src = { id: "s", country: "UY" }
  assert.deepEqual(classify({ title: "Fidae 2026 reunirá obras de nueve países en octubre en Uruguay", summary: "" }, src).disciplines, ["festival"])
  assert.ok(disciplinesOf("Festival Internacional de Teatro de Paysandú").includes("festival"))
  assert.ok(disciplinesOf("Comienza el Festival Iberoamericano de Danza").includes("festival"))
  assert.ok(disciplinesOf("Francia sedujo al Festival Internacional Cervantino").includes("festival"))
  assert.deepEqual(disciplinesOf("Convocatoria para proyectos de artes escénicas"), ["escena"])
  assert.equal(classify({ title: "Película chilena triunfa en Festival de Cine de Valdivia", summary: "Se proyectó en el teatro municipal." }, src).reason, "other-arts")
  assert.equal(classify({ title: "Al Paso, el festival de vinos uruguayos, cambia de fecha", summary: "Habrá música en vivo con una banda local." }, src).reason, "other-arts")
  assert.equal(classify({ title: "Documental sobre la Comedia Nacional", summary: "" }, src).keep, true)
})

test("filters agendas, ticket sales and bare event listings", () => {
  assert.equal(isListing("Agenda cultural del fin de semana", ""), true)
  assert.equal(isListing("Entradas a la venta para el festival de teatro", ""), true)
  assert.equal(isListing("Hamlet en El Galpón", "Sábado 21:00. Entradas $600 en Tickantel."), true)
  assert.equal(isListing("Quién toca en el Movistar Arena hoy: todos los recitales de la semana", ""), true)
  assert.equal(isListing("Weekly Schedule of Current Broadway Shows", ""), true)
  assert.equal(isListing("El Galpón celebra 75 años con una temporada de estrenos", "La institución anunció su programación y homenajes a sus fundadores."), false)
})

test("places Uruguayan items: Montevideo, interior, ambiguous names", () => {
  assert.deepEqual(findUruguayPlace("Festival de teatro en Salto"), { department: "Salto", city: null, ambiguous: true })
  assert.equal(findUruguayPlace("Un salto de calidad para la danza"), null)
  assert.deepEqual(findUruguayPlace("Estreno en Punta del Este"), { department: "Maldonado", city: "Punta del Este", ambiguous: false })
  assert.equal(findUruguayPlace("Homenaje en la Plaza de Artigas"), null)
  assert.deepEqual(findUruguayPlace("Gira por Colonia del Sacramento y Montevideo"), { department: "Colonia", city: "Colonia del Sacramento", ambiguous: false })
  assert.equal(findUruguayPlace("Fructuoso Rivera fue presidente"), null)
})

test("a local outlet's item defaults to its department; text wins when it names another", () => {
  const paysandu = { id: "telegrafo", country: "UY", department: "Paysandú", city: "Paysandú" }
  assert.deepEqual(placeOf({ title: "Obra de teatro local", summary: "" }, paysandu),
    { section: "uy", country: "UY", department: "Paysandú", city: "Paysandú", area: "interior" })
  assert.equal(placeOf({ title: "Elenco local actúa en Montevideo", summary: "" }, paysandu).area, "montevideo")
  assert.equal(placeOf({ title: "Fidae 2026 reunirá obras de nueve países en octubre en Uruguay", summary: "" }, { id: "cero", country: "UY", department: "Maldonado" }).department, null)
  const colonia = { id: "carmelo", country: "UY", department: "Colonia", city: "Carmelo" }
  assert.equal(placeOf({ title: "Recrean un día en la Estancia de Belén", summary: "" }, colonia).department, "Colonia")
  const national = { id: "diaria", country: "UY" }
  assert.deepEqual(placeOf({ title: "Debate sobre la danza", summary: "" }, national),
    { section: "uy", country: "UY", department: null, city: null, area: null })
})

test("foreign outlets stay international unless the story names Uruguay or Montevideo", () => {
  const ar = { id: "pagina12", country: "AR" }
  assert.equal(placeOf({ title: "Actor uruguayo estrena en Buenos Aires", summary: "" }, ar).section, "intl")
  assert.equal(placeOf({ title: "Festival en Rosario", summary: "" }, ar).section, "intl")
  const moved = placeOf({ title: "Compañía argentina llega a Montevideo", summary: "" }, ar)
  assert.equal(moved.section, "uy")
  assert.equal(moved.department, "Montevideo")
  assert.deepEqual(placeOf({ title: "Ballet in London", summary: "" }, { id: "x", country: "GB" }),
    { section: "intl", country: "GB", department: null, city: null, area: "world" })
})

test("classify keeps performing-arts news and says why it drops the rest", () => {
  const src = { id: "s", country: "UY" }
  assert.equal(classify({ title: "Resultados del fútbol", summary: "" }, src).reason, "not-performing-arts")
  assert.equal(classify({ title: "Cartelera de teatro", summary: "" }, src).reason, "listing")
  const kept = classify({ title: "Estreno de danza contemporánea en Melo", summary: "" }, src)
  assert.equal(kept.keep, true)
  assert.equal(kept.department, "Cerro Largo")
  assert.deepEqual(kept.disciplines, ["danza"])
})
