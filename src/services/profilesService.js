// Perfil propio, configuración y publicaciones de la cuenta.
import { getDb, commit, latency, clone, nowISO } from './adapter/demoStore'
import { requireUser } from './access'
import { invalid } from './errors'
import { PUBLICATION_TYPES, transitionPublication, deletePublication } from './publications'
import { todayISO } from '@/utils/dates'
import { opportunityPublicState, OPEN_REQUEST_STATES } from '@/utils/workflows'

// Campos que la persona puede editar de su perfil.
const EDITABLE = ['firstName', 'lastName', 'avatar', 'bio', 'city', 'country', 'specialties', 'links', 'publicContact', 'interests']

// Lo que se muestra de una persona a terceros: nunca email ni teléfono
// salvo que la persona lo haya marcado como público.
export function publicProfile(user) {
  if (!user || user.status !== 'active' || user.privacy?.profilePublic === false) return null
  return {
    id: user.id, name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, bio: user.bio,
    city: user.city, country: user.country, specialties: user.specialties, links: user.links,
    email: user.publicContact?.showEmail ? user.email : null,
    phone: user.publicContact?.phone || null,
  }
}

export const profilesService = {
  async getPublic(userId) {
    await latency(60)
    return clone(publicProfile(getDb().users.find((u) => u.id === userId)))
  },

  async updateMe(data) {
    await latency(250)
    const user = requireUser()
    if (data.firstName !== undefined && !data.firstName.trim()) throw invalid('El nombre es obligatorio.', { firstName: 'Obligatorio' })
    for (const link of data.links ?? []) {
      if (!/^https:\/\//.test(link.url)) throw invalid('Los enlaces deben empezar con https://', { links: 'Enlace no válido' })
    }
    for (const key of EDITABLE) if (data[key] !== undefined) user[key] = data[key]
    user.updatedAt = nowISO()
    commit()
    return clone(user)
  },

  async updateSettings({ notificationPrefs, privacy }) {
    await latency(200)
    const user = requireUser()
    if (notificationPrefs) user.notificationPrefs = { ...user.notificationPrefs, ...notificationPrefs }
    if (privacy) user.privacy = { ...user.privacy, ...privacy }
    user.updatedAt = nowISO()
    commit()
    return clone(user)
  },

  // Indicadores del resumen, calculados con los datos reales de la cuenta.
  async dashboard() {
    await latency()
    const user = requireUser()
    const db = getDb()
    const own = (list) => list.filter((x) => x.ownerId === user.id && !x.deletedAt)
    const publications = [...own(db.venues), ...own(db.shows), ...own(db.professionals)]
    const activePublications = publications.filter((p) => p.publicationStatus === 'published').length +
      own(db.opportunities).filter((o) => o.status === 'published').length
    const receivedPending = [
      ...db.bookingRequests.filter((r) => own(db.venues).some((v) => v.id === r.venueId)),
      ...(db.venueInquiries ?? []).filter((r) => own(db.venues).some((v) => v.id === r.venueId)),
      ...db.showInquiries.filter((r) => own(db.shows).some((s) => s.id === r.showId)),
      ...db.serviceInquiries.filter((r) => own(db.professionals).some((p) => p.id === r.serviceId)),
      ...db.applications.filter((r) => own(db.opportunities).some((o) => o.id === r.opportunityId)),
    ].filter((r) => OPEN_REQUEST_STATES.includes(r.status) && r.status !== 'draft').length
    const sentPending = [
      ...db.bookingRequests, ...(db.venueInquiries ?? []), ...db.showInquiries, ...db.serviceInquiries,
    ].filter((r) => r.requesterId === user.id && OPEN_REQUEST_STATES.includes(r.status)).length +
      db.applications.filter((a) => a.applicantId === user.id && OPEN_REQUEST_STATES.includes(a.status)).length
    const convIds = new Set(db.conversations.filter((c) => c.participantIds.includes(user.id)).map((c) => c.id))
    return {
      activePublications,
      receivedPending,
      sentPending,
      favorites: db.favorites.filter((f) => f.userId === user.id).length,
      unreadMessages: db.messages.filter((m) => convIds.has(m.conversationId) && m.senderId !== user.id && !m.readAt).length,
      unreadNotifications: db.notifications.filter((n) => n.userId === user.id && !n.readAt).length,
    }
  },

  async listMyPublications({ type = '' } = {}) {
    await latency()
    const user = requireUser()
    const db = getDb()
    const today = todayISO()
    const out = []
    for (const [key, c] of Object.entries(PUBLICATION_TYPES)) {
      if (type && key !== type) continue
      for (const item of db[c.collection]) {
        if (item.ownerId !== user.id || item.deletedAt) continue
        const status = key === 'opportunity' ? opportunityPublicState(item, today) : item[c.statusKey]
        out.push({
          type: key, typeLabel: c.label, id: item.id, slug: item.slug, title: item[c.titleKey],
          status, storedStatus: item[c.statusKey], moderationNote: item.moderationNote ?? null,
          createdAt: item.createdAt, updatedAt: item.updatedAt,
        })
      }
    }
    return clone(out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  async setPublicationStatus(type, id, to) {
    await latency(150)
    return clone(transitionPublication(type, id, to))
  },

  async deletePublication(type, id) {
    await latency(150)
    deletePublication(type, id)
  },
}
