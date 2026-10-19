// Decides whether an item is performing-arts news, which disciplines it
// covers, and where it happened. Keyword rules on the title and the feed's
// own summary: transparent, testable, and nothing is guessed beyond the text.
import { fold } from "./text.mjs"
import { COUNTRIES, NAMES_URUGUAY, findUruguayPlace, isMontevideo } from "./geo.mjs"

export const DISCIPLINES = [
  { id: "teatro", label: "Teatro", re: /\bteatr(o|os|al|ales)\b|\bdramaturg|\bpuesta en escena\b|\bcomedia nacional\b|\bunipersonal\b|\btheat(re|er|rical)\b|\bplaywright\b/ },
  { id: "danza", label: "Danza", re: /\bdanza(s)?\b|\bballet\b|\bcoreograf|\bbailarin(a|as|es)?\b|\bflamenco\b|\bdance(r|rs)?\b|\bchoreograph/ },
  { id: "musica", label: "Música en vivo", re: /\bconcierto(s)?\b|\brecital(es)?\b|\bmusica en vivo\b|\ben vivo\b.*\b(banda|cantante|musico|show)\b|\borquesta\b|\bfilarmonica\b|\bsinfonica\b|\bconcert(s)?\b|\blive music\b|\bsymphony\b/ },
  { id: "opera", label: "Ópera y lírica", re: /\bzarzuela\b|\b(temporada|canto|cantante|gala|elenco) liric|\bsoprano(s)?\b|\bopera house\b/ },
  { id: "circo", label: "Circo", re: /\bcirco(s)?\b|\bcircense(s)?\b|\bacrobat|\bmalabar|\bclown(s)?\b|\bpayas(o|a|os|as)\b|\bcircus\b/ },
  { id: "titeres", label: "Títeres", re: /\btitere(s)?\b|\btitiriter|\bmarioneta(s)?\b|\bpuppet/ },
  { id: "carnaval", label: "Carnaval y murga", re: /\bmurga(s)?\b|\bparodista(s)?\b|\bhumorista(s)? del carnaval\b|\bcarnaval\b|\bcandombe\b|\bsociedad(es)? de negros y lubolos\b|\brevista(s)? del carnaval\b/ },
  { id: "musical", label: "Teatro musical", re: /\b(teatro|comedia) musical\b|\bmusical(es)? de broadway\b|\bbroadway\b|\bwest end\b|\bthe musical\b/ },
  { id: "performance", label: "Performance", re: /\bperformance (artistica|escenica|art)\b|\barte de accion\b|\bperformer(s)?\b/ },
  // Festivals of the stage: Uruguayan ones by their acronym (FIDAE, FITDAP,
  // FIDCU), the big international ones by name, and any "festival de teatro /
  // danza / artes escénicas / circo / títeres".
  { id: "festival", label: "Festivales", re: /\b(fidae|fitdap|fidcu)\b|\bfestival(es)? (internacional(es)? |nacional(es)? |iberoamericano |latinoamericano |regional |departamental )?de (teatro|danza|artes escenicas|artes performaticas|circo|titeres|clown|performance|opera|ballet)\b|\bmicro ?festival del teatro\b|\bcervantino\b|\bsantiago a mil\b|\bfestival d'avignon\b|\bavignon\b|\bfringe\b|\bfestival de almagro\b|\btheat(re|er) festival\b|\bdance festival\b/ },
  { id: "escena", label: "Artes escénicas", re: /\bartes escenicas\b|\bperforming arts\b/ },
]

// "Ópera" needs its accent: unaccented "opera" is also the verb ("la empresa opera").
const OPERA_ACCENTED = /(?<![\p{L}])[óÓ]pera(s)?(?![\p{L}])|\bopera\b(?= (house|company|singer))/u

// Stories about film, books, wine... that mention the stage in passing ("se
// proyecta en el teatro", "festival de cine"): dropped unless the title itself
// names a stage discipline.
const OTHER_ARTS_TITLE = /\b(pelicula(s)?|film(e|s)?|cine|cineasta(s)?|documental(es)?|serie(s)?|novela(s)?|libro(s)?|literatura|festival (internacional )?(de|del) (cine|vinos?|cerveza|libro|gastronomia)|movie(s)?|book(s)?)\b/

// Uses of "teatro" that have nothing to do with the stage.
const FALSE_FRIENDS = /\bteatro de (operaciones|la guerra|guerra|los suenos)\b/

// Listings, agendas, giveaways and ticket sales are not news.
const LISTING_TITLE = /^(agenda|cartelera|guia|que hacer|que ver|planes|recomendados|imperdibles|\d+ (planes|propuestas|espectaculos|obras|shows))\b|\b(entradas a la venta|venta de entradas|ya estan a la venta|preventa|2x1|sorteo|sorteamos|ganate|gana entradas|concurso de entradas|descuento(s)? (para|en))\b|\bwhat'?s on\b|\btickets? (on sale|now)\b|\bquien toca\b|\btodos los (recitales|shows|espectaculos|conciertos|estrenos)\b|\b(recitales|shows|estrenos|cartelera) de la semana\b|\bweekly schedule\b|\bschedule of (current )?\w+ shows\b/
const TICKET_DETAILS = /\b(entradas|tickets?)\b[^.]{0,60}(\$|uyu|usd|pesos|tickantel|redtickets|abitab|passline|ticketek)|\b(tickantel|redtickets|passline)\b/
const SCHEDULE = /\b\d{1,2}(:|\.|h)\d{2}\b|\b\d{1,2} ?h(s|oras)?\b/

export function disciplinesOf(text) {
  const f = fold(text)
  if (FALSE_FRIENDS.test(f)) return []
  const found = DISCIPLINES.filter((d) => d.re.test(f)).map((d) => d.id)
  if (OPERA_ACCENTED.test(text) && !found.includes("opera")) found.push("opera")
  return found
}

// A short blurb whose substance is the date, time and ticket price.
export function isListing(title, summary) {
  const t = fold(title)
  if (LISTING_TITLE.test(t)) return true
  const s = fold(summary)
  return s.length < 220 && TICKET_DETAILS.test(s) && SCHEDULE.test(s)
}

// Location and section for an item, from the source's declared coverage and
// what the text says. Returns null fields when nothing can be identified.
const NATIONWIDE = /(?<![\p{L}])(Uruguay|todo el pa[ií]s|todo el territorio)(?![\p{L}])/u

export function placeOf(item, source) {
  const text = `${item.title}. ${item.summary}`
  // A foreign outlet's story goes to Uruguay only when it names the country or
  // its capital: "uruguayo" alone is often a Uruguayan artist abroad, and
  // names like "Salto" or "Rosario" also exist in Argentina.
  const local = source.country === "UY" || NAMES_URUGUAY.test(text)
  if (local) {
    let found = findUruguayPlace(text)
    // A local outlet naming an ambiguous place ("Belén", "Rosario") most
    // likely means one near home, not the homonym in another department.
    if (found?.ambiguous && source.department && found.department !== source.department) found = null
    // A local outlet's story about the whole country ("en Uruguay", "en todo
    // el país") is not placed in the outlet's department.
    const national = !found && NATIONWIDE.test(text)
    const department = found?.department ?? (national ? null : source.department) ?? null
    const city = found ? found.city : source.department && department === source.department ? source.city ?? null : null
    return { section: "uy", country: "UY", department, city, area: department ? (isMontevideo(department) ? "montevideo" : "interior") : null }
  }
  return { section: "intl", country: source.country ?? null, department: null, city: source.city ?? null, area: COUNTRIES[source.country]?.region ?? null }
}

export function classify(item, source) {
  const text = `${item.title}. ${item.summary}`
  const disciplines = disciplinesOf(text)
  if (!disciplines.length) return { keep: false, reason: "not-performing-arts" }
  if (OTHER_ARTS_TITLE.test(fold(item.title)) && !disciplinesOf(item.title).length) return { keep: false, reason: "other-arts" }
  if (isListing(item.title, item.summary)) return { keep: false, reason: "listing" }
  return { keep: true, disciplines, ...placeOf(item, source) }
}
