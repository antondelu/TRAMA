// Directorio de profesionales y proveedores (ProfessionalService).
import { getDb, latency, clone } from './adapter/demoStore'
import { matchesText, relevance, paginate, toNumber, byText, byPrice, isPublic } from './query'
import { requireOwner, requireUser } from './access'
import { notFound } from './errors'
import { savePublication, canSeeUnpublished } from './publications'

// Vista pública: sin los datos de contacto privados.
const publicView = ({ contact, ...rest }) => rest

export const servicesService = {
  async list(params = {}) {
    await latency()
    const priceMax = toNumber(params.priceMax)

    let items = getDb().professionals.filter(isPublic).filter((p) =>
      matchesText(params.q, [p.name, p.headline, p.description, p.location.city]) &&
      (!params.specialty || p.specialties.includes(params.specialty)) &&
      (!params.city || p.location.city === params.city) &&
      (!params.department || p.location.department === params.department) &&
      (!params.availability || p.availability === params.availability) &&
      (!params.workMode || p.workModes.includes(params.workMode)) &&
      (priceMax == null || (p.priceFrom != null && p.priceFrom <= priceMax)) &&
      (!params.experience || p.experienceLevel === params.experience) &&
      (!params.providerType || p.providerType === params.providerType) &&
      matchesText(params.offered, [p.servicesOffered]),
    )

    const sorts = {
      name: byText('name'),
      price_asc: byPrice('asc'),
      experience: (a, b) => b.experienceYears - a.experienceYears,
      relevance: (a, b) =>
        relevance(params.q, b.name, [b.headline, b.servicesOffered]) - relevance(params.q, a.name, [a.headline, a.servicesOffered]) ||
        Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es'),
    }
    items = [...items].sort(sorts[params.sort] ?? sorts.relevance).map(publicView)
    return clone(paginate(items, params.page))
  },

  async featured(limit = 4) {
    await latency()
    return clone(getDb().professionals.filter((p) => isPublic(p) && p.featured).slice(0, limit).map(publicView))
  },

  async getBySlug(slug) {
    await latency()
    const pro = getDb().professionals.find((p) => p.slug === slug && !p.deletedAt)
    if (!pro || (!isPublic(pro) && !canSeeUnpublished(pro))) throw notFound('El perfil')
    return clone({ ...publicView(pro), isPreview: !isPublic(pro) })
  },

  async listMine() {
    await latency()
    const user = requireUser()
    return clone(getDb().professionals.filter((p) => p.ownerId === user.id && !p.deletedAt))
  },

  async getForEdit(id) {
    await latency()
    const pro = getDb().professionals.find((p) => p.id === id && !p.deletedAt)
    if (!pro) throw notFound('El perfil')
    requireOwner(pro)
    return clone(pro)
  },

  async save(data, options) {
    await latency(200)
    return clone(savePublication('service', data, options))
  },
}
