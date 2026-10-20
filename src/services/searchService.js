// Búsqueda global. En la demo recorre los datos locales usando los mismos
// servicios de cada catálogo; con más volumen se reemplaza por un endpoint
// de búsqueda en el servidor (misma firma: search(q, scope)).

import { venuesService } from './venuesService'
import { showsService } from './showsService'
import { servicesService } from './servicesService'
import { opportunitiesService } from './opportunitiesService'
import { resourcesService } from './resourcesService'

const SOURCES = {
  salas: { service: venuesService, type: 'venue', label: 'Salas', map: (v) => ({ title: v.name, subtitle: `${v.city} · ${v.capacity} personas` }) },
  espectaculos: { service: showsService, type: 'show', label: 'Espectáculos', map: (s) => ({ title: s.title, subtitle: s.company }) },
  servicios: { service: servicesService, type: 'service', label: 'Servicios', map: (p) => ({ title: p.name, subtitle: p.headline }) },
  oportunidades: { service: opportunitiesService, type: 'opportunity', label: 'Convocatorias', map: (o) => ({ title: o.title, subtitle: o.organizationName }) },
  recursos: { service: resourcesService, type: 'resource', label: 'Recursos', map: (r) => ({ title: r.title, subtitle: r.author }) },
}

export const searchService = {
  async search(q, scope = 'all', { perGroup = 5 } = {}) {
    const term = String(q ?? '').trim()
    if (!term) return []
    const keys = scope === 'all' ? Object.keys(SOURCES) : [scope].filter((k) => SOURCES[k])
    const groups = await Promise.all(keys.map(async (key) => {
      const src = SOURCES[key]
      const res = await src.service.list({ q: term, sort: 'relevance' })
      return {
        scope: key, label: src.label, total: res.total,
        items: res.items.slice(0, perGroup).map((item) => ({ id: item.id, slug: item.slug, type: src.type, ...src.map(item) })),
      }
    }))
    return groups.filter((g) => g.total > 0)
  },
}
