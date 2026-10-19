// Solicitudes: reservas de sala, consultas de contratación (espectáculos y
// servicios) y postulaciones a convocatorias. Cada tipo tiene su colección y
// su máquina de estados (utils/workflows.js).
//
// En la demo nada de esto es una reserva ni una contratación real. Las reglas
// de concurrencia definitivas (doble reserva) tienen que vivir en el backend.

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { requireUser } from './access'
import { conflict, forbidden, invalid, notFound } from './errors'
import { pushNotification } from './notificationsService'
import { availabilityMap } from './venuesService'
import { isOpenOpportunity } from './opportunitiesService'
import { REQUEST_KINDS, canTransitionRequest, allowedTransitions, stateLabelFor, OPEN_REQUEST_STATES } from '@/utils/workflows'
import { todayISO } from '@/utils/dates'
import { formatDate } from '@/utils/format'

const fullName = (id) => {
  const u = getDb().users.find((x) => x.id === id)
  return u ? `${u.firstName} ${u.lastName}` : 'Cuenta eliminada'
}

// Para cada tipo: quién envía, quién recibe y sobre qué entidad.
const KIND_META = {
  booking: {
    sender: (r) => r.requesterId,
    entity: (r) => getDb().venues.find((v) => v.id === r.venueId),
    entityType: 'venue', entityTitle: (e) => e?.name,
  },
  showInquiry: {
    sender: (r) => r.requesterId,
    entity: (r) => getDb().shows.find((s) => s.id === r.showId),
    entityType: 'show', entityTitle: (e) => e?.title,
  },
  serviceInquiry: {
    sender: (r) => r.requesterId,
    entity: (r) => getDb().professionals.find((p) => p.id === r.serviceId),
    entityType: 'service', entityTitle: (e) => e?.name,
  },
  application: {
    sender: (r) => r.applicantId,
    entity: (r) => getDb().opportunities.find((o) => o.id === r.opportunityId),
    entityType: 'opportunity', entityTitle: (e) => e?.title,
  },
}

const receiverOf = (kind, r) => KIND_META[kind].entity(r)?.ownerId
const collectionOf = (kind) => getDb()[REQUEST_KINDS[kind].collection]

function sideOf(kind, r, userId) {
  if (KIND_META[kind].sender(r) === userId) return 'sender'
  if (receiverOf(kind, r) === userId) return 'receiver'
  return null
}

// Otras solicitudes activas de la misma sala y fecha.
function bookingConflicts(r) {
  return getDb().bookingRequests.filter((x) =>
    x.id !== r.id && x.venueId === r.venueId && x.date === r.date &&
    (x.status === 'accepted' || (OPEN_REQUEST_STATES.includes(x.status) && x.status !== 'draft')))
}

function view(kind, r, userId) {
  const meta = KIND_META[kind]
  const entity = meta.entity(r)
  const side = sideOf(kind, r, userId)
  const counterpartId = side === 'sender' ? receiverOf(kind, r) : meta.sender(r)
  const actions = allowedTransitions(kind, r.status, side)
  return {
    ...r,
    kind,
    kindLabel: REQUEST_KINDS[kind].label,
    side,
    stateLabel: stateLabelFor(r.status, side),
    entityType: meta.entityType,
    entitySlug: entity?.slug,
    entityTitle: meta.entityTitle(entity) ?? 'Publicación eliminada',
    counterpartName: fullName(counterpartId),
    senderName: fullName(meta.sender(r)),
    actions,
    canAcceptProposal: kind === 'booking' && side === 'sender' && r.status === 'in_conversation' && Boolean(r.proposedDate),
    conflicts: kind === 'booking' ? bookingConflicts(r).map((x) => ({ id: x.id, status: x.status, requester: fullName(x.requesterId) })) : [],
  }
}

function record(r, by, from, to, note = null) {
  r.history = [...(r.history ?? []), { at: nowISO(), by, from, to, note }]
  r.status = to
  r.updatedAt = nowISO()
}

function create(kind, data, senderKey, { asDraft = false, notifyTitle }) {
  const user = requireUser()
  const now = nowISO()
  const item = { ...data, id: newId(kind.slice(0, 2)), [senderKey]: user.id, status: 'draft', history: [], createdAt: now, updatedAt: now }
  if (!asDraft) record(item, user.id, 'draft', 'sent')
  collectionOf(kind).push(item)
  const receiverId = receiverOf(kind, item)
  if (!asDraft && receiverId) {
    pushNotification(receiverId, 'new_request', notifyTitle, `${user.firstName} ${user.lastName} te envió una solicitud.`, '/mi-cuenta/solicitudes')
  }
  commit()
  return clone(view(kind, item, user.id))
}

function assertNotOwn(entity, user) {
  if (!entity) throw notFound('La publicación')
  if (entity.ownerId === user.id) throw forbidden('No podés enviarte una solicitud a vos mismo.')
}

export const requestsService = {
  async createBooking({ venueId, date, timeSlot, activityType, functionCount, message, asDraft }) {
    await latency(250)
    const user = requireUser()
    const venue = getDb().venues.find((v) => v.id === venueId && v.publicationStatus === 'published' && !v.deletedAt)
    assertNotOwn(venue, user)
    if (!date || date < todayISO()) throw invalid('Elegí una fecha futura.', { date: 'Elegí una fecha futura' })
    const status = availabilityMap(venueId, date, date)[date]?.status ?? 'unknown'
    if (['blocked', 'internal', 'confirmed'].includes(status)) {
      throw conflict('Esa fecha no está disponible en esta sala. Elegí otra en el calendario.')
    }
    return create('booking', {
      venueId, date, timeSlot, activityType, functionCount: Number(functionCount) || 0, message: message ?? '',
      startDateTime: `${date}T00:00:00-03:00`, endDateTime: `${date}T23:59:00-03:00`, proposedDate: null,
    }, 'requesterId', { asDraft, notifyTitle: `Nueva solicitud de reserva para ${venue.name}` })
  },

  async createShowInquiry({ showId, organization, venueName, requestedDates, functionCount, message, asDraft }) {
    await latency(250)
    const user = requireUser()
    const show = getDb().shows.find((s) => s.id === showId && s.publicationStatus === 'published' && !s.deletedAt)
    assertNotOwn(show, user)
    return create('showInquiry', { showId, organization, venueName, requestedDates, functionCount: Number(functionCount) || 0, message },
      'requesterId', { asDraft, notifyTitle: `Consulta de contratación: ${show.title}` })
  },

  async createServiceInquiry({ serviceId, projectType, requestedDate, location, projectDescription, budget, message, asDraft }) {
    await latency(250)
    const user = requireUser()
    const pro = getDb().professionals.find((p) => p.id === serviceId && p.publicationStatus === 'published' && !p.deletedAt)
    assertNotOwn(pro, user)
    return create('serviceInquiry', {
      serviceId, projectType, requestedDate, location, projectDescription, budget: budget ? Number(budget) : null, message: message ?? '',
    }, 'requesterId', { asDraft, notifyTitle: `Consulta de servicio: ${pro.name}` })
  },

  async apply({ opportunityId, showId, proposal }) {
    await latency(250)
    const user = requireUser()
    const db = getDb()
    const o = db.opportunities.find((x) => x.id === opportunityId && !x.deletedAt)
    assertNotOwn(o, user)
    if (!isOpenOpportunity(o)) throw conflict('Esta convocatoria ya no recibe postulaciones.')
    if (o.applicationStart > todayISO()) throw conflict('La convocatoria todavía no abrió.')
    if (o.applicationMode !== 'internal') throw invalid('Esta convocatoria se gestiona fuera de TRAMA.')
    if (showId && !db.shows.some((s) => s.id === showId && s.ownerId === user.id)) throw forbidden('Solo podés postular espectáculos propios.')
    if (db.applications.some((a) => a.opportunityId === o.id && a.applicantId === user.id && a.status !== 'withdrawn')) {
      throw conflict('Ya te postulaste a esta convocatoria. Podés seguirla en Solicitudes.')
    }
    const now = nowISO()
    const item = {
      id: newId('ap'), opportunityId, applicantId: user.id, showId: showId || null, proposal, attachments: [],
      status: 'sent', history: [{ at: now, by: user.id, from: null, to: 'sent', note: null }], createdAt: now, updatedAt: now,
    }
    db.applications.push(item)
    pushNotification(o.ownerId, 'new_request', `Nueva postulación: ${o.title}`, `${user.firstName} ${user.lastName} se postuló.`, '/mi-cuenta/solicitudes')
    commit()
    return clone(view('application', item, user.id))
  },

  async myApplicationFor(opportunityId) {
    await latency(40)
    const user = requireUser()
    const a = getDb().applications.find((x) => x.opportunityId === opportunityId && x.applicantId === user.id && x.status !== 'withdrawn')
    return a ? clone(view('application', a, user.id)) : null
  },

  // box: 'sent' | 'received' | 'all'
  async list({ box = 'all', kind = '', status = '' } = {}) {
    await latency()
    const user = requireUser()
    const out = []
    for (const k of Object.keys(REQUEST_KINDS)) {
      if (kind && k !== kind) continue
      for (const r of collectionOf(k)) {
        const side = sideOf(k, r, user.id)
        if (!side) continue
        // Los borradores son privados de quien los escribe.
        if (side === 'receiver' && r.status === 'draft') continue
        if (box === 'sent' && side !== 'sender') continue
        if (box === 'received' && side !== 'receiver') continue
        if (status && r.status !== status) continue
        out.push(view(k, r, user.id))
      }
    }
    return clone(out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  async listForVenue(venueId) {
    await latency()
    const user = requireUser()
    const venue = getDb().venues.find((v) => v.id === venueId)
    if (!venue) throw notFound('La sala')
    if (venue.ownerId !== user.id) throw forbidden()
    return clone(getDb().bookingRequests.filter((r) => r.venueId === venueId && r.status !== 'draft')
      .map((r) => view('booking', r, user.id)).sort((a, b) => a.date.localeCompare(b.date)))
  },

  async transition(kind, id, to, { note = null } = {}) {
    await latency(200)
    const user = requireUser()
    const r = collectionOf(kind)?.find((x) => x.id === id)
    if (!r) throw notFound('La solicitud')
    const side = sideOf(kind, r, user.id)
    if (!side) throw forbidden()
    if (!canTransitionRequest(kind, r.status, to, side)) {
      throw invalid(`No se puede pasar de "${stateLabelFor(r.status, side)}" a "${stateLabelFor(to, side)}".`)
    }

    if (kind === 'booking' && to === 'accepted') {
      // Se vuelve a comprobar en el momento de aceptar.
      const others = bookingConflicts(r)
      if (others.some((x) => x.status === 'accepted')) throw conflict('Ya hay una reserva aceptada para esa fecha. Rechazá esta solicitud o proponé otra fecha.')
      const base = getDb().venueAvailability.find((a) => a.venueId === r.venueId && a.date === r.date)?.status
      if (base !== 'available') {
        throw conflict(`La fecha ${formatDate(r.date)} no figura como disponible en el calendario de la sala. Marcala como disponible antes de aceptar.`)
      }
    }
    record(r, user.id, r.status, to, note)
    const otherId = side === 'sender' ? receiverOf(kind, r) : KIND_META[kind].sender(r)
    const entityTitle = KIND_META[kind].entityTitle(KIND_META[kind].entity(r))
    pushNotification(otherId, side === 'receiver' ? 'request_response' : 'status_change',
      `${REQUEST_KINDS[kind].label}: ${stateLabelFor(to, side === 'sender' ? 'receiver' : 'sender')}`,
      `${entityTitle}${note ? ` — ${note}` : ''}`, '/mi-cuenta/solicitudes')
    commit()
    return clone(view(kind, r, user.id))
  },

  // La sala propone otra fecha: la solicitud pasa (o sigue) en conversación.
  async proposeDate(id, proposedDate, note = null) {
    await latency(200)
    const user = requireUser()
    const r = getDb().bookingRequests.find((x) => x.id === id)
    if (!r) throw notFound('La solicitud')
    if (sideOf('booking', r, user.id) !== 'receiver') throw forbidden()
    if (!['sent', 'in_conversation'].includes(r.status)) throw invalid('Solo se puede proponer otra fecha mientras la solicitud está abierta.')
    if (!proposedDate || proposedDate < todayISO()) throw invalid('La fecha propuesta tiene que ser futura.')
    r.proposedDate = proposedDate
    record(r, user.id, r.status, 'in_conversation', note || `Propuesta de otra fecha: ${formatDate(proposedDate)}`)
    const venue = getDb().venues.find((v) => v.id === r.venueId)
    pushNotification(r.requesterId, 'request_response', `${venue.name} propuso otra fecha`, formatDate(proposedDate), '/mi-cuenta/solicitudes')
    commit()
    return clone(view('booking', r, user.id))
  },

  // Quien pidió la reserva acepta la fecha alternativa que propuso la sala.
  async acceptProposedDate(id) {
    await latency(200)
    const user = requireUser()
    const r = getDb().bookingRequests.find((x) => x.id === id)
    if (!r || r.requesterId !== user.id) throw forbidden()
    if (r.status !== 'in_conversation' || !r.proposedDate) throw invalid('No hay una fecha propuesta para aceptar.')
    const previous = r.date
    r.date = r.proposedDate
    r.startDateTime = `${r.date}T00:00:00-03:00`
    r.endDateTime = `${r.date}T23:59:00-03:00`
    r.proposedDate = null
    r.history.push({ at: nowISO(), by: user.id, from: 'in_conversation', to: 'in_conversation', note: `Fecha cambiada de ${formatDate(previous)} a ${formatDate(r.date)}` })
    r.updatedAt = nowISO()
    const venue = getDb().venues.find((v) => v.id === r.venueId)
    pushNotification(venue.ownerId, 'request_response', 'Aceptaron la fecha que propusiste', `${venue.name}: ${formatDate(r.date)}`, '/mi-cuenta/calendario')
    commit()
    return clone(view('booking', r, user.id))
  },

  // Enviar un borrador.
  async submitDraft(kind, id) {
    return this.transition(kind, id, 'sent')
  },
}
