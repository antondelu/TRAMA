// Noticias de artes escénicas: lee lo que guarda el servicio news/server.mjs,
// que consulta las fuentes cada 12 horas desde el servidor. Son datos reales
// también en modo demo: si el servicio no responde, se informa el error en
// lugar de mostrar noticias inventadas.

import { INTEGRATIONS } from '@/config/integrations'
import { ServiceError } from './errors'

// Solo en desarrollo: si el servicio no está corriendo, el proxy de Vite
// responde 500 sin cuerpo (el servicio siempre responde JSON).
const DEV_SERVICE_DOWN = 'El servicio de noticias no está corriendo. Usá npm start (levanta la web y las noticias) o npm run dev:news en otra terminal.'
async function serviceDown(res) {
  return res.status === 500 && !res.headers.get('content-type')?.includes('json') && !(await res.text())
}

export const newsService = {
  // section: 'uy' | 'intl'. Devuelve { items, total, page, pageCount, hasMore, facets, lastSuccessAt }.
  async list({ section, discipline, location, page = 1, pageSize } = {}, { signal } = {}) {
    const params = new URLSearchParams({ section, page: String(page) })
    if (discipline) params.set('discipline', discipline)
    if (location) params.set('location', location)
    if (pageSize) params.set('pageSize', String(pageSize))
    const res = await fetch(`${INTEGRATIONS.news.endpoint}?${params}`, { signal }).catch((err) => {
      if (err?.name === 'AbortError') throw err
      return null
    })
    if (!res) throw new ServiceError('unavailable', 'No pudimos conectar con el servidor de noticias. Probá de nuevo en unos minutos.')
    if (res.status === 429) throw new ServiceError('rate_limited', 'Hiciste muchas consultas seguidas. Esperá un minuto y probá de nuevo.')
    if (!res.ok) {
      if (import.meta.env.DEV && (await serviceDown(res))) throw new ServiceError('unavailable', DEV_SERVICE_DOWN)
      throw new ServiceError('unavailable', 'Las noticias no están disponibles en este momento.')
    }
    return res.json()
  },
}
