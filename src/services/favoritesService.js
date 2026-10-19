import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { requireUser } from './access'
import { invalid } from './errors'

const SOURCES = {
  venue: { collection: 'venues', title: 'name', subtitle: (e) => `${e.city} · ${e.capacity} personas`, live: (e) => e.publicationStatus === 'published' },
  show: { collection: 'shows', title: 'title', subtitle: (e) => e.company, live: (e) => e.publicationStatus === 'published' },
  service: { collection: 'professionals', title: 'name', subtitle: (e) => e.headline, live: (e) => e.publicationStatus === 'published' },
  opportunity: { collection: 'opportunities', title: 'title', subtitle: (e) => e.organizationName, live: (e) => e.status === 'published' },
  resource: { collection: 'resources', title: 'title', subtitle: (e) => e.author, live: (e) => e.publicationStatus === 'published' },
}

export const favoritesService = {
  // Ids guardados por tipo, para pintar el botón de favorito.
  async keys() {
    const user = requireUser()
    return getDb().favorites.filter((f) => f.userId === user.id).map((f) => `${f.entityType}:${f.entityId}`)
  },

  async list({ entityType = '' } = {}) {
    await latency()
    const user = requireUser()
    const db = getDb()
    const out = []
    for (const f of db.favorites) {
      if (f.userId !== user.id || (entityType && f.entityType !== entityType)) continue
      const src = SOURCES[f.entityType]
      const e = db[src.collection].find((x) => x.id === f.entityId && !x.deletedAt)
      if (!e) continue
      out.push({ ...f, title: e[src.title], subtitle: src.subtitle(e), slug: e.slug, available: src.live(e) })
    }
    return clone(out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async toggle(entityType, entityId) {
    await latency(80)
    const user = requireUser()
    if (!SOURCES[entityType]) throw invalid('Tipo no válido.')
    const db = getDb()
    const existing = db.favorites.find((f) => f.userId === user.id && f.entityType === entityType && f.entityId === entityId)
    if (existing) db.favorites = db.favorites.filter((f) => f !== existing)
    else db.favorites.push({ id: newId('f'), userId: user.id, entityType, entityId, createdAt: nowISO() })
    commit()
    return !existing
  },
}
