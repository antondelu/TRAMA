import { getDb, latency, clone } from './adapter/demoStore'
import { matchesText, relevance, paginate, toNumber, byText, byPrice, isPublic } from './query'
import { requireOwner, requireUser } from './access'
import { notFound } from './errors'
import { savePublication, canSeeUnpublished } from './publications'

export const showsService = {
  async list(params = {}) {
    await latency()
    const durationMax = toNumber(params.durationMax)
    const castMax = toNumber(params.castMax)

    let items = getDb().shows.filter(isPublic).filter((s) =>
      matchesText(params.q, [s.title, s.company, s.synopsis, s.description, s.city]) &&
      (!params.discipline || s.discipline === params.discipline) &&
      (!params.genre || s.genre === params.genre) &&
      (durationMax == null || s.durationMinutes <= durationMax) &&
      (castMax == null || s.castSize <= castMax) &&
      (!params.audience || s.audience === params.audience) &&
      (!params.technicalNeeds || s.technicalNeeds === params.technicalNeeds) &&
      (!params.stagingFormat || s.stagingFormat === params.stagingFormat) &&
      (!params.bookingMode || s.bookingModes.includes(params.bookingMode)) &&
      (params.touring !== '1' || s.touring) &&
      (!params.country || s.country === params.country) &&
      (!params.city || s.city === params.city) &&
      (!params.availability || s.availability === params.availability),
    )

    const sorts = {
      title: byText('title'),
      duration: (a, b) => a.durationMinutes - b.durationMinutes,
      price_asc: byPrice('asc'),
      price_desc: byPrice('desc'),
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      relevance: (a, b) =>
        relevance(params.q, b.title, [b.company, b.synopsis]) - relevance(params.q, a.title, [a.company, a.synopsis]) ||
        Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, 'es'),
    }
    items = [...items].sort(sorts[params.sort] ?? sorts.relevance)
    return clone(paginate(items, params.page))
  },

  async featured(limit = 4) {
    await latency()
    return clone(getDb().shows.filter((s) => isPublic(s) && s.featured).slice(0, limit))
  },

  async getBySlug(slug) {
    await latency()
    const show = getDb().shows.find((s) => s.slug === slug && !s.deletedAt)
    if (!show || (!isPublic(show) && !canSeeUnpublished(show))) throw notFound('El espectáculo')
    return clone({ ...show, isPreview: !isPublic(show) })
  },

  // Espectáculos propios publicados: los usa la postulación a convocatorias.
  async listMine({ publishedOnly = false } = {}) {
    await latency()
    const user = requireUser()
    return clone(getDb().shows.filter((s) => s.ownerId === user.id && !s.deletedAt && (!publishedOnly || isPublic(s))))
  },

  async getForEdit(id) {
    await latency()
    const show = getDb().shows.find((s) => s.id === id && !s.deletedAt)
    if (!show) throw notFound('El espectáculo')
    requireOwner(show)
    return clone(show)
  },

  async save(data, options) {
    await latency(200)
    return clone(savePublication('show', data, options))
  },
}
