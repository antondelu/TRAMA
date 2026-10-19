// Biblioteca de recursos. El control de acceso se aplica ACÁ, al devolver los
// datos: si la persona no tiene acceso, el contenido protegido (body,
// mediaUrl, fileUrl) directamente no se entrega. En producción esto lo hace
// el servidor; ocultar con CSS no protege nada.

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { matchesText, relevance, paginate } from './query'
import { can, currentUser, requirePermission } from './access'
import { invalid, notFound } from './errors'
import { RESOURCE_COLLECTIONS } from '@/data/mock/resources'
import { slugify } from '@/utils/slug'

export const ACCESS_LEVELS = {
  public: { label: 'Gratuito', permission: null },
  member: { label: 'Miembros', permission: 'resources:member' },
  premium: { label: 'Plan Profesional', permission: 'resources:premium' },
}

export function canAccess(resource, user = currentUser()) {
  const rule = ACCESS_LEVELS[resource.accessLevel]
  return !rule?.permission || can(rule.permission, user)
}

// Publicado y con fecha de publicación alcanzada (permite programar).
function isLive(r) {
  return r.publicationStatus === 'published' && !r.deletedAt && (!r.publishedAt || r.publishedAt <= nowISO())
}

// Versión pública: sin el contenido protegido.
function publicView(r) {
  const { body, mediaUrl, fileUrl, ...rest } = r
  return { ...rest, hasMedia: Boolean(mediaUrl), hasFile: Boolean(fileUrl), locked: true }
}

function forViewer(r, user) {
  return canAccess(r, user) ? { ...r, hasMedia: Boolean(r.mediaUrl), hasFile: Boolean(r.fileUrl), locked: false } : publicView(r)
}

// Los listados nunca incluyen el contenido completo.
const summary = (r) => publicView(r)

export const resourcesService = {
  async list(params = {}) {
    await latency()
    let items = getDb().resources.filter(isLive).filter((r) =>
      matchesText(params.q, [r.title, r.description, r.author]) &&
      (!params.type || r.resourceType === params.type) &&
      (!params.category || r.category === params.category) &&
      (!params.topic || r.topics.includes(params.topic)) &&
      (!params.author || r.author === params.author) &&
      (!params.access || (params.access === 'free' ? r.accessLevel === 'public' : r.accessLevel !== 'public')),
    )
    const sorts = {
      recent: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
      relevance: (a, b) =>
        relevance(params.q, b.title, [b.description]) - relevance(params.q, a.title, [a.description]) ||
        Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt),
    }
    items = [...items].sort(sorts[params.sort] ?? sorts.recent)
    return clone({ ...paginate(items, params.page), items: paginate(items, params.page).items.map(summary) })
  },

  async authors() {
    await latency(40)
    return [...new Set(getDb().resources.filter(isLive).map((r) => r.author))].sort((a, b) => a.localeCompare(b, 'es'))
  },

  async featured(limit = 4) {
    await latency()
    return clone(getDb().resources.filter((r) => isLive(r) && r.featured).slice(0, limit).map(summary))
  },

  async latest(limit = 4) {
    await latency()
    return clone([...getDb().resources.filter(isLive)].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit).map(summary))
  },

  async collections() {
    await latency()
    const live = getDb().resources.filter(isLive)
    return clone(RESOURCE_COLLECTIONS.map((c) => ({
      ...c, items: c.resourceIds.map((id) => live.find((r) => r.id === id)).filter(Boolean).map(summary),
    })))
  },

  async getBySlug(slug) {
    await latency()
    const user = currentUser()
    const r = getDb().resources.find((x) => x.slug === slug && !x.deletedAt)
    const visible = r && (isLive(r) || can('resources:manage', user))
    if (!visible) throw notFound('El recurso')
    return clone({ ...forViewer(r, user), isPreview: !isLive(r) })
  },

  async related(resource, limit = 3) {
    await latency(60)
    const items = getDb().resources
      .filter((r) => isLive(r) && r.id !== resource.id)
      .map((r) => ({ r, score: (r.category === resource.category ? 2 : 0) + r.topics.filter((t) => resource.topics.includes(t)).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => summary(x.r))
    return clone(items)
  },

  // --- Gestión editorial (editores y administradores) ---

  async listAll({ status } = {}) {
    await latency()
    requirePermission('resources:manage')
    return clone(getDb().resources.filter((r) => !r.deletedAt && (!status || r.publicationStatus === status))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  async getForEdit(id) {
    await latency()
    requirePermission('resources:manage')
    const r = getDb().resources.find((x) => x.id === id && !x.deletedAt)
    if (!r) throw notFound('El recurso')
    return clone(r)
  },

  async save(data) {
    await latency(200)
    const user = requirePermission('resources:manage')
    const db = getDb()
    const now = nowISO()
    const slug = slugify(data.slug || data.title)
    if (!data.title?.trim()) throw invalid('Falta el título.')
    if (db.resources.some((r) => r.slug === slug && r.id !== data.id && !r.deletedAt)) {
      throw invalid('Esa dirección (slug) ya está en uso.', { slug: 'Ya está en uso' })
    }
    // Un archivo asociado tiene que ser una ruta del sitio o una URL https.
    for (const key of ['fileUrl', 'mediaUrl']) {
      if (data[key] && !/^(\/|https:\/\/)/.test(data[key])) throw invalid('Las rutas de archivos deben empezar con / o https://', { [key]: 'Ruta no válida' })
    }
    const existing = data.id && db.resources.find((r) => r.id === data.id)
    if (existing) {
      Object.assign(existing, data, { slug, updatedAt: now })
      commit()
      return clone(existing)
    }
    const item = {
      topics: [], body: [], featured: false, coverImage: null, mediaUrl: null, fileUrl: null, pages: null,
      ...data, id: newId('r'), slug, authorId: data.authorId ?? user.id, publicationStatus: data.publicationStatus ?? 'draft',
      createdAt: now, updatedAt: now,
    }
    db.resources.push(item)
    commit()
    return clone(item)
  },

  // publish acepta una fecha futura para programar la publicación.
  async setStatus(id, status, { publishAt = null } = {}) {
    await latency(100)
    requirePermission('resources:manage')
    const r = getDb().resources.find((x) => x.id === id && !x.deletedAt)
    if (!r) throw notFound('El recurso')
    if (!['draft', 'published', 'archived'].includes(status)) throw invalid('Estado no válido.')
    r.publicationStatus = status
    if (status === 'published') r.publishedAt = publishAt ?? r.publishedAt ?? nowISO()
    r.updatedAt = nowISO()
    commit()
    return clone(r)
  },
}
