import { getDb, commit, latency, clone, nowISO, newId } from './adapter/demoStore'
import { matchesText, relevance, paginate, toList, toNumber, byText, byPrice, isPublic } from './query'
import { requireOwner, requireUser } from './access'
import { notFound } from './errors'
import { savePublication, canSeeUnpublished } from './publications'
import { todayISO } from '@/utils/dates'
import { OPEN_REQUEST_STATES } from '@/utils/workflows'

// Estado de cada fecha para una sala, combinando lo que cargó la sala con las
// solicitudes de reserva:
//   unknown   la sala no informó nada: NUNCA se muestra como libre
//   available libre según la sala y sin solicitudes
//   pending   hay solicitudes sin resolver (no es una reserva)
//   confirmed hay una reserva aceptada
//   blocked   la sala la bloqueó
//   internal  evento interno de la sala
export function availabilityMap(venueId, from, to) {
  const db = getDb()
  const map = {}
  for (const row of db.venueAvailability) {
    if (row.venueId !== venueId || row.date < from || row.date > to) continue
    map[row.date] = { status: row.status, notes: row.notes, requests: [] }
  }
  for (const req of db.bookingRequests) {
    if (req.venueId !== venueId || req.date < from || req.date > to) continue
    const isOpen = OPEN_REQUEST_STATES.includes(req.status) && req.status !== 'draft'
    if (req.status !== 'accepted' && !isOpen) continue
    const day = (map[req.date] ??= { status: 'unknown', notes: null, requests: [] })
    day.requests.push(req.id)
    if (req.status === 'accepted') day.status = 'confirmed'
    else if (day.status === 'available') day.status = 'pending'
  }
  return map
}

export function isDateBookable(venueId, date) {
  return availabilityMap(venueId, date, date)[date]?.status === 'available'
}

function hasOpenCall(venueId, today) {
  return getDb().opportunities.some((o) => o.venueId === venueId && o.status === 'published' && o.deadline >= today && !o.deletedAt)
}

// Próxima fecha libre confirmada por la sala (en los próximos 90 días).
function nextAvailableDate(venueId, today) {
  const end = new Date(`${today}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + 90)
  const map = availabilityMap(venueId, today, end.toISOString().slice(0, 10))
  return Object.keys(map).sort().find((d) => map[d].status === 'available') ?? null
}

// Vista pública: sin los datos de contacto privados de la sala.
function decorate(venue, today) {
  const { contactPreferences, ...rest } = venue
  return {
    ...rest,
    contactPreferences: { viaPlatform: contactPreferences?.viaPlatform ?? true },
    hasOpenCall: hasOpenCall(venue.id, today),
    nextAvailable: nextAvailableDate(venue.id, today),
  }
}

export const venuesService = {
  async list(params = {}) {
    await latency()
    const today = todayISO()
    const equipment = toList(params.equipment)
    const accessibility = toList(params.accessibility)
    const capMin = toNumber(params.capMin)
    const capMax = toNumber(params.capMax)
    const priceMin = toNumber(params.priceMin)
    const priceMax = toNumber(params.priceMax)

    let items = getDb().venues.filter(isPublic).map((v) => decorate(v, today)).filter((v) =>
      matchesText(params.q, [v.name, v.description, v.city, v.department, v.address?.area]) &&
      (!params.city || v.city === params.city) &&
      (!params.department || v.department === params.department) &&
      (capMin == null || v.capacity >= capMin) &&
      (capMax == null || v.capacity <= capMax) &&
      (!params.type || v.venueType === params.type) &&
      equipment.every((e) => v.equipment.includes(e)) &&
      accessibility.every((a) => v.accessibility.includes(a)) &&
      (!params.rentalMode || v.rentalModes.includes(params.rentalMode)) &&
      // Con filtro de precio, las salas sin precio informado quedan afuera.
      (priceMin == null || (v.priceTo ?? v.priceFrom) >= priceMin) &&
      (priceMax == null || (v.priceFrom != null && v.priceFrom <= priceMax)) &&
      (!params.date || isDateBookable(v.id, params.date)) &&
      (params.openCalls !== '1' || v.hasOpenCall),
    )

    const sorts = {
      name: byText('name'),
      price_asc: byPrice('asc'),
      price_desc: byPrice('desc'),
      relevance: (a, b) =>
        relevance(params.q, b.name, [b.description, b.city]) - relevance(params.q, a.name, [a.description, a.city]) ||
        Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es'),
    }
    items = [...items].sort(sorts[params.sort] ?? sorts.relevance)
    return clone(paginate(items, params.page))
  },

  async featured(limit = 4) {
    await latency()
    const today = todayISO()
    return clone(getDb().venues.filter((v) => isPublic(v) && v.featured).slice(0, limit).map((v) => decorate(v, today)))
  },

  async getBySlug(slug) {
    await latency()
    const db = getDb()
    const venue = db.venues.find((v) => v.slug === slug && !v.deletedAt)
    if (!venue || (!isPublic(venue) && !canSeeUnpublished(venue))) throw notFound('La sala')
    const today = todayISO()
    const openCalls = db.opportunities.filter((o) => o.venueId === venue.id && o.status === 'published' && o.deadline >= today && !o.deletedAt)
    return clone({ ...decorate(venue, today), openCalls, isPreview: !isPublic(venue) })
  },

  async getAvailability(venueId, from, to) {
    await latency(60)
    return clone(availabilityMap(venueId, from, to))
  },

  async listMine() {
    await latency()
    const user = requireUser()
    return clone(getDb().venues.filter((v) => v.ownerId === user.id && !v.deletedAt))
  },

  async getForEdit(id) {
    await latency()
    const venue = getDb().venues.find((v) => v.id === id && !v.deletedAt)
    if (!venue) throw notFound('La sala')
    requireOwner(venue)
    return clone(venue)
  },

  async save(data, options) {
    await latency(200)
    return clone(savePublication('venue', data, options))
  },

  // La sala marca fechas como disponibles, bloqueadas o eventos internos.
  async setDates(venueId, dates, status, notes = null) {
    await latency(80)
    const db = getDb()
    const venue = db.venues.find((v) => v.id === venueId)
    if (!venue) throw notFound('La sala')
    requireOwner(venue)
    const now = nowISO()
    for (const date of dates) {
      let row = db.venueAvailability.find((r) => r.venueId === venueId && r.date === date)
      if (status === 'unknown') {
        db.venueAvailability = db.venueAvailability.filter((r) => r !== row)
        continue
      }
      if (!row) {
        row = { id: newId('av'), venueId, date, startDateTime: `${date}T09:00:00-03:00`, endDateTime: `${date}T23:59:00-03:00` }
        db.venueAvailability.push(row)
      }
      Object.assign(row, { status, notes: status === 'internal' ? notes : null, updatedAt: now })
    }
    commit()
  },
}
