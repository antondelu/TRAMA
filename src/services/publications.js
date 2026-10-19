// Lógica común de publicaciones (salas, espectáculos, servicios y
// convocatorias): crear, editar, cambiar de estado y eliminar, siempre
// respetando la máquina de estados y quién es el dueño.

import { getDb, commit, newId, nowISO } from './adapter/demoStore'
import { requireUser, requireOwner, isModerator } from './access'
import { canTransitionPublication } from '@/utils/workflows'
import { uniqueSlug, slugify } from '@/utils/slug'
import { forbidden, invalid, notFound } from './errors'
import { pushNotification } from './notificationsService'

export const PUBLICATION_TYPES = {
  venue: { collection: 'venues', statusKey: 'publicationStatus', titleKey: 'name', prefix: 'v', label: 'Sala' },
  show: { collection: 'shows', statusKey: 'publicationStatus', titleKey: 'title', prefix: 's', label: 'Espectáculo' },
  service: { collection: 'professionals', statusKey: 'publicationStatus', titleKey: 'name', prefix: 'p', label: 'Servicio' },
  opportunity: { collection: 'opportunities', statusKey: 'status', titleKey: 'title', prefix: 'o', label: 'Convocatoria' },
}
// Los recursos tienen su propio flujo editorial (resourcesService).

function config(type) {
  const c = PUBLICATION_TYPES[type]
  if (!c) throw invalid(`Tipo de publicación desconocido: ${type}`)
  return c
}

export function findPublication(type, id) {
  const { collection } = config(type)
  const item = getDb()[collection].find((x) => x.id === id && !x.deletedAt)
  if (!item) throw notFound('La publicación')
  return item
}

export function isSlugTaken(type, slug, exceptId) {
  const { collection } = config(type)
  return getDb()[collection].some((x) => x.slug === slug && x.id !== exceptId && !x.deletedAt)
}

// Crea o actualiza. `submit` la envía a moderación; si no, queda en borrador.
// Una publicación ya publicada que se edita vuelve a moderación.
export function savePublication(type, data, { submit = false } = {}) {
  const c = config(type)
  const db = getDb()
  const user = requireUser()
  const now = nowISO()
  const list = db[c.collection]
  const title = data[c.titleKey]?.trim()
  if (!title) throw invalid('Falta el nombre o título.')

  const requestedSlug = slugify(data.slug || title)
  const existing = data.id ? findPublication(type, data.id) : null
  if (existing) requireOwner({ ownerId: existing[c.ownerKey ?? 'ownerId'] })
  if (requestedSlug && isSlugTaken(type, requestedSlug, existing?.id)) {
    throw invalid('Esa dirección (slug) ya está en uso. Elegí otra.', { slug: 'Ya está en uso' })
  }

  const status = submit ? 'pending' : 'draft'
  if (existing) {
    const keepId = existing.id
    Object.assign(existing, data, {
      id: keepId, slug: requestedSlug, [c.statusKey]: status, ownerId: existing.ownerId, updatedAt: now,
    })
    commit()
    return existing
  }

  const taken = new Set(list.map((x) => x.slug))
  const item = {
    ...data,
    id: newId(c.prefix),
    ownerId: user.id,
    slug: requestedSlug || uniqueSlug(title, taken),
    [c.statusKey]: status,
    featured: false,
    createdAt: now,
    updatedAt: now,
  }
  list.push(item)
  commit()
  return item
}

// Cambia el estado validando quién lo pide (dueño o moderador).
export function transitionPublication(type, id, to, { note = null } = {}) {
  const c = config(type)
  const item = findPublication(type, id)
  const user = requireUser()
  const ownerId = item[c.ownerKey ?? 'ownerId']
  const from = item[c.statusKey]
  const actor = isModerator(user) && ownerId !== user.id ? 'moderator' : 'owner'
  if (actor === 'owner' && ownerId !== user.id) throw forbidden()
  if (!canTransitionPublication(from, to, actor)) {
    throw invalid(`No se puede pasar de "${from}" a "${to}".`)
  }
  item[c.statusKey] = to
  item.updatedAt = nowISO()
  if (note) item.moderationNote = note
  getDb().auditLog.unshift({ id: newId('log'), at: item.updatedAt, by: user.id, entityType: type, entityId: id, from, to, note })
  if (actor === 'moderator') {
    const messages = {
      published: 'fue aprobada y ya es pública',
      rejected: 'fue rechazada',
      changes_requested: 'necesita cambios antes de publicarse',
      archived: 'fue archivada',
    }
    pushNotification(ownerId, 'status_change', `Tu publicación ${messages[to] ?? 'cambió de estado'}`,
      `${item[c.titleKey]}${note ? ` — ${note}` : ''}`, '/mi-cuenta/publicaciones')
  }
  commit()
  return item
}

// Eliminación lógica: deja de aparecer en todos los listados.
export function deletePublication(type, id) {
  const c = config(type)
  const item = findPublication(type, id)
  requireOwner({ ownerId: item[c.ownerKey ?? 'ownerId'] })
  item.deletedAt = nowISO()
  item.updatedAt = item.deletedAt
  getDb().favorites = getDb().favorites.filter((f) => !(f.entityType === type && f.entityId === id))
  commit()
}

// Lo que el dueño puede ver aunque no sea público.
export function canSeeUnpublished(item, ownerKey = 'ownerId') {
  try {
    const user = requireUser()
    return item[ownerKey] === user.id || isModerator(user)
  } catch {
    return false
  }
}
