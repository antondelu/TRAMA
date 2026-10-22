// Baja la cartelera de teatro de Montevideo de RedTickets y de Cartelera
// (Montevideo Portal), las cruza y escribe src/data/cartelera/montevideo.json,
// que es lo que muestra el mapa de la home. Correr con: npm run cartelera
//
// RedTickets trae coordenadas, horarios y precio; Cartelera suma obras que no
// se venden por RedTickets, el género y la dirección. Las salas que solo están
// en Cartelera se ubican por su dirección con Nominatim (OpenStreetMap) y el
// resultado queda guardado en scripts/cartelera-geocache.json.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'src/data/cartelera/montevideo.json')
const GEOCACHE = path.join(ROOT, 'scripts/cartelera-geocache.json')
const DAYS_AHEAD = 14
const UA = 'TRAMA/0.1 (cartelera de artes escenicas)'
const RT = 'https://redtickets.uy'
const CA = 'https://cartelera.montevideo.com.uy'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log(...a)

async function get(url, { delay = 250 } = {}) {
  await sleep(delay) // de a una y sin apuro: son sitios de terceros
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-UY' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&([a-z]+);/gi, (m, e) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', uuml: 'ü', iexcl: '¡', iquest: '¿' }[e] ?? m))
const text = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

// Para cruzar fuentes: sin tildes, sin mayúsculas, sin "(Sala X)" ni "| Sala Dos".
export function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\(.*?\)/g, ' ').split('|')[0].replace(/[^a-z0-9]+/g, ' ').trim()
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function todayMontevideo() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Montevideo' }).format(new Date())
}

// "Sábado 24 de Octubre" -> '2026-10-24' (el año se deduce: no viene en la página).
function parseSpanishDate(s, today) {
  const m = s.toLowerCase().match(/(\d{1,2}) de ([a-záéíóú]+)/)
  if (!m) return null
  const month = MONTHS.indexOf(m[2])
  if (month < 0) return null
  let year = Number(today.slice(0, 4))
  if (month + 1 < Number(today.slice(5, 7)) - 1) year += 1
  return `${year}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

function gxState(html) {
  const m = html.match(/name="GXState" value='(.*?)'/s) ?? html.match(/name="GXState" value="(.*?)"/s)
  return m ? JSON.parse(decode(m[1])) : null
}

// ---------------------------------------------------------------- RedTickets
async function fromRedTickets(today, until) {
  const events = []
  for (let page = 0; page < 30; page++) {
    const state = gxState(await get(`${RT}/categoria/6/Teatro${page ? `/${page}` : ''}`))
    const list = state?.vSDTPLAINEVTCOLLECTION ?? []
    if (!list.length || events.some((e) => e.Id === list[0].Id)) break
    events.push(...list)
  }
  log(`RedTickets: ${events.length} eventos de teatro`)

  const out = []
  for (const e of events) {
    let state
    try {
      state = gxState(await get(`${RT}${e.Link}`))
    } catch (err) {
      log(`  salteo ${e.Title}: ${err.message}`)
      continue
    }
    const info = Object.values(state ?? {}).find((v) => v?.Evt?.locationName !== undefined && v?.Location)
    const purchase = Object.values(state ?? {}).find((v) => Array.isArray(v?.Evt?.Dates))
    if (!info || !purchase) continue
    if (!/montevideo/i.test(info.Evt.cityname ?? '')) continue
    const geo = info.Location.GeoPoint?.match(/POINT \((-?[\d.]+) (-?[\d.]+)\)/)
    const place = {
      name: decode(info.Evt.locationName).trim(),
      address: info.Location.Address?.replace(/^.*? - /, '').replace(/,\s*\d{5}.*$/, '').trim() || null,
      lon: geo ? Number(geo[1]) : null,
      lat: geo ? Number(geo[2]) : null,
    }
    for (const d of purchase.Evt.Dates) {
      if (d.date < today || d.date > until) continue
      for (const t of d.Times ?? []) {
        if (!/^\d{1,2}:\d{2}$/.test(t.caption)) continue
        const prices = (t.Tickets ?? []).map((k) => Number(k.price)).filter((n) => n > 0)
        out.push({
          title: decode(e.Title).trim(), date: d.date, time: t.caption.padStart(5, '0'), place,
          priceFrom: prices.length ? Math.min(...prices) : (purchase.Evt.isFree ? 0 : null),
          soldOut: Boolean(t.soldOut || d.soldOut),
          ticketUrl: `${RT}${e.Link}`,
        })
      }
    }
  }
  log(`RedTickets: ${out.length} funciones en Montevideo`)
  return out
}

// ----------------------------------------------------------------- Cartelera
async function cartelleraVenues() {
  const html = await get(`${CA}/apeliculafunciones.aspx?,,,OBRA,-1,116`)
  const venues = new Map()
  // Cada sala: nombre, "Dirección: ..." y el enlace con su id.
  const blocks = html.split(/Ver obras y funciones/)
  for (const block of blocks) {
    const id = block.match(/apeliculafunciones\.aspx\?,(\d+),,OBRA,-1,114/g)?.at(-1)?.match(/,(\d+),/)?.[1]
    if (!id) continue
    const plain = text(block.slice(-3000))
    const m = plain.match(/([^]*?)Dirección:\s*(.*?)(?:Teléfono:|$)/)
    if (m) venues.set(id, { address: m[2].trim() })
  }
  return venues
}

async function fromCartelera(today, until) {
  const list = await get(`${CA}/apeliculafunciones.aspx?,,PELICULAS_ALFABETICO,OBRA,0,111`)
  const ids = [...new Set([...list.matchAll(/averespectaculo\.aspx\?(\d+)/g)].map((m) => m[1]))]
  log(`Cartelera: ${ids.length} obras`)
  const venues = await cartelleraVenues()

  const out = []
  for (const id of ids) {
    let html
    try {
      html = await get(`${CA}/averespectaculo.aspx?${id}`)
    } catch (err) {
      log(`  salteo obra ${id}: ${err.message}`)
      continue
    }
    const title = text(html.match(/<h2 class="name bold" itemprop="name">(.*?)<\/h2>/s)?.[1] ?? '')
    if (!title) continue
    const field = (label) => {
      const m = html.match(new RegExp(`${label}:?\\s*<strong[^>]*>(.*?)</strong>`, 's'))
      return m ? text(m[1]) || null : null
    }
    const genre = field('G&eacute;nero')
    const director = field('Direcci&oacute;n')
    const duration = Number(field('Duraci&oacute;n')?.match(/\d+/)?.[0]) || null
    const priceText = text(html.match(/Localidades<\/h4>\s*<p[^>]*>(.*?)<\/p>/s)?.[1] ?? '')
    const price = priceText.match(/\$\s*([\d.]+)/)
    const free = /entrada (libre|gratuita)|gratis/i.test(priceText)

    const salas = html.split('<div class="heading-holder">').slice(1)
    for (const sala of salas) {
      const link = sala.match(/apeliculafunciones\.aspx\?,(\d+),,OBRA,-1,114">(.*?)<\/a>/s)
      if (!link) continue
      const [, venueId, rawName] = link
      const schedule = sala.split('</ul> <!-- .lista-horarios')[0]
      for (const day of schedule.split('<p class="subheading">').slice(1)) {
        const date = parseSpanishDate(text(day.split('</p>')[0]), today)
        if (!date || date < today || date > until) continue
        for (const h of day.matchAll(/<li class="hour">\s*(\d{1,2}[:.]\d{2})/g)) {
          out.push({
            title, genre, director, durationMinutes: duration, date, time: h[1].replace('.', ':').padStart(5, '0'),
            place: { name: text(rawName), address: venues.get(venueId)?.address ?? null, lon: null, lat: null },
            priceFrom: free ? 0 : price ? Number(price[1].replace(/\./g, '')) : null,
            sourceUrl: `${CA}/averespectaculo.aspx?${id}`,
          })
        }
      }
    }
  }
  log(`Cartelera: ${out.length} funciones`)
  return out
}

// Sin comprobar antes si existe: se lee y, si no está, se arranca vacío.
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

// Escribe a un temporal y lo renombra: el archivo nunca queda a medio escribir.
function writeAtomic(file, content) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, content)
  fs.renameSync(tmp, file)
}

// ------------------------------------------------------------- Geolocalizar
async function geocode(address, cache) {
  const key = normalize(address)
  if (key in cache) return cache[key]
  const q = `${address.split(/ esq\.| - |\(/)[0]}, Montevideo, Uruguay`
  const res = JSON.parse(await get(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=uy&q=${encodeURIComponent(q)}`, { delay: 1100 }))
  cache[key] = res[0] ? { lon: Number(Number(res[0].lon).toFixed(6)), lat: Number(Number(res[0].lat).toFixed(6)) } : null
  return cache[key]
}

// ---------------------------------------------------------------- Cruce
const STOPWORDS = new Set(['teatro', 'sala', 'de', 'la', 'el', 'del', 'los', 'las'])

// Salas que ni RedTickets ni Nominatim ubican bien.
const MANUAL_PLACES = [
  [/movie/i, { lon: -56.1366, lat: -34.9035 }], // Montevideo Shopping
  [/sobre ruedas/i, { lon: -56.2057, lat: -34.9085 }], // explanada del Teatro Solís
]
const manualPlace = (p) => MANUAL_PLACES.find(([re]) => re.test(p.name))?.[1] ?? {}

// Eventos que RedTickets marca como Montevideo pero son en el interior.
const OTHER_CITIES = /\b(salto|paysand[uú]|maldonado|punta del este|colonia|rivera|treinta y tres|tacuaremb[oó]|nueva helvecia)\b/i

// Mismo título escrito distinto: uno contiene al otro o empiezan con las mismas tres palabras.
function sameTitle(a, b) {
  const [x, y] = [normalize(a), normalize(b)]
  return x.includes(y) || y.includes(x) || x.split(' ').slice(0, 3).join(' ') === y.split(' ').slice(0, 3).join(' ')
}

// RedTickets escribe muchos títulos en mayúsculas.
function tidyTitle(t) {
  const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '')
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length
  return letters.length > 3 && upper / letters.length > 0.8 ? t.charAt(0) + t.slice(1).toLowerCase() : t
}
async function main() {
  const today = todayMontevideo()
  const end = new Date(`${today}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + DAYS_AHEAD)
  const until = end.toISOString().slice(0, 10)

  const rt = await fromRedTickets(today, until)
  const ca = await fromCartelera(today, until)

  // Salas: se juntan por nombre (sin "teatro", "sala", "de la"...) o por calle
  // y número, porque cada sitio las escribe distinto. Las coordenadas de RedTickets mandan.
  const places = new Map()
  const alias = new Map()
  const nameKey = (p) => normalize(p.name.split(/ - |\. /)[0]).split(' ').filter((w) => !STOPWORDS.has(w)).join(' ')
  const addressKey = (p) => {
    const m = p.address && normalize(p.address).match(/([a-z]+) (\d{2,5})\b/)
    return m ? `@${m[1]} ${m[2]}` : null
  }
  const addPlace = (p) => {
    const keys = [nameKey(p), addressKey(p)].filter(Boolean)
    const key = keys.map((k) => alias.get(k)).find(Boolean) ?? keys[0]
    for (const k of keys) if (!alias.has(k)) alias.set(k, key)
    const cur = places.get(key)
    if (!cur) places.set(key, { id: `pl-${key.replace(/[@ ]+/g, '-')}`, ...p, ...manualPlace(p) })
    else {
      if (cur.lat == null && p.lat != null) Object.assign(cur, { lon: p.lon, lat: p.lat, address: cur.address ?? p.address })
      // A veces RedTickets pone la dirección como nombre ("Paraguay 1217").
      if (/^[^\d]+ \d+$/.test(cur.name) && !/^[^\d]+ \d+$/.test(p.name)) cur.name = p.name
    }
    return key
  }

  const byKey = new Map()
  for (const r of rt) {
    if (OTHER_CITIES.test(`${r.title} ${r.place.name}`)) continue
    const k = `${normalize(r.title)}|${r.date}|${r.time}`
    byKey.set(k, { ...r, placeKey: addPlace(r.place), sources: ['redtickets'] })
  }
  for (const c of ca) {
    if (OTHER_CITIES.test(`${c.title} ${c.place.name}`)) continue
    const k = `${normalize(c.title)}|${c.date}|${c.time}`
    const pk = addPlace(c.place)
    const same = byKey.get(k) ?? [...byKey.values()].find((x) =>
      x.placeKey === pk && x.date === c.date && x.time === c.time && sameTitle(x.title, c.title))
    if (same) {
      // El título de Cartelera viene en mayúsculas y minúsculas normales.
      Object.assign(same, { title: c.title, genre: c.genre, director: c.director, durationMinutes: c.durationMinutes, sourceUrl: c.sourceUrl })
      same.sources.push('cartelera')
    } else {
      byKey.set(k, { ...c, placeKey: pk, sources: ['cartelera'] })
    }
  }

  const cache = readJson(GEOCACHE) ?? {}
  for (const p of places.values()) {
    if (p.lat != null || !p.address) continue
    const g = await geocode(p.address, cache)
    if (g) Object.assign(p, g)
  }
  writeAtomic(GEOCACHE, `${JSON.stringify(cache, null, 2)}\n`)

  const performances = [...byKey.values()]
    .sort((a, b) => `${a.date}${a.time}${a.title}`.localeCompare(`${b.date}${b.time}${b.title}`, 'es'))
    .map(({ placeKey, ...p }) => ({
      id: `pf-${normalize(p.title).replace(/ /g, '-').slice(0, 40)}-${p.date}-${p.time.replace(':', '')}`,
      title: tidyTitle(p.title), genre: p.genre ?? null, director: p.director ?? null, durationMinutes: p.durationMinutes ?? null,
      date: p.date, time: p.time, placeId: places.get(placeKey).id,
      priceFrom: p.priceFrom, soldOut: p.soldOut ?? false,
      ticketUrl: p.ticketUrl ?? null, sourceUrl: p.sourceUrl ?? null, sources: p.sources,
    }))
  const usedPlaces = [...places.values()].filter((p) => performances.some((x) => x.placeId === p.id))
    .map(({ id, name, address, lon, lat }) => ({ id, name, address, lon, lat }))

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  writeAtomic(OUT, `${JSON.stringify({ fetchedAt: new Date().toISOString(), from: today, until, places: usedPlaces, performances }, null, 1)}\n`)
  const noGeo = usedPlaces.filter((p) => p.lat == null).map((p) => p.name)
  log(`Listo: ${performances.length} funciones en ${usedPlaces.length} salas -> ${path.relative(ROOT, OUT)}`)
  if (noGeo.length) log(`Sin ubicar (salen en la lista, no en el mapa): ${noGeo.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
