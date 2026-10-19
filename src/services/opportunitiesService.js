import { getDb, latency, clone } from './adapter/demoStore'
import { matchesText, relevance, paginate } from './query'
import { requireOwner, requireUser } from './access'
import { notFound } from './errors'
import { savePublication, canSeeUnpublished } from './publications'
import { todayISO } from '@/utils/dates'
import { opportunityPublicState } from '@/utils/workflows'

// Público = publicada y con la fecha límite sin pasar.
export function isOpenOpportunity(o, today = todayISO()) {
  return !o.deletedAt && opportunityPublicState(o, today) === 'published'
}

function decorate(o, today) {
  const state = opportunityPublicState(o, today)
  return { ...o, publicState: state, acceptsApplications: state === 'published' && o.applicationStart <= today }
}

export const opportunitiesService = {
  async list(params = {}) {
    await latency()
    const today = todayISO()
    let items = getDb().opportunities.filter((o) => isOpenOpportunity(o, today)).filter((o) =>
      matchesText(params.q, [o.title, o.organizationName, o.description, o.location.scope]) &&
      (!params.type || o.opportunityType === params.type) &&
      (!params.country || o.location.country === params.country) &&
      (!params.city || o.location.city === params.city) &&
      (!params.discipline || o.disciplines.includes(params.discipline)) &&
      (!params.organizationType || o.organizationType === params.organizationType) &&
      (!params.deadlineBefore || o.deadline <= params.deadlineBefore) &&
      (!params.compensation || o.compensation.type === params.compensation),
    ).map((o) => decorate(o, today))

    const sorts = {
      deadline: (a, b) => a.deadline.localeCompare(b.deadline),
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      relevance: (a, b) =>
        relevance(params.q, b.title, [b.organizationName, b.description]) - relevance(params.q, a.title, [a.organizationName, a.description]) ||
        a.deadline.localeCompare(b.deadline),
    }
    items = [...items].sort(sorts[params.sort] ?? sorts.deadline)
    return clone(paginate(items, params.page))
  },

  async featured(limit = 3) {
    await latency()
    const today = todayISO()
    return clone(getDb().opportunities
      .filter((o) => isOpenOpportunity(o, today))
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, limit)
      .map((o) => decorate(o, today)))
  },

  // Las vencidas y cerradas se pueden abrir por enlace (para historial), pero
  // se marcan como tales y no aceptan postulaciones.
  async getBySlug(slug) {
    await latency()
    const today = todayISO()
    const o = getDb().opportunities.find((x) => x.slug === slug && !x.deletedAt)
    const visible = o && (['published', 'closed'].includes(o.status) || canSeeUnpublished(o))
    if (!visible) throw notFound('La convocatoria')
    return clone({ ...decorate(o, today), isPreview: !['published', 'closed'].includes(o.status) })
  },

  async listMine() {
    await latency()
    const user = requireUser()
    return clone(getDb().opportunities.filter((o) => o.ownerId === user.id && !o.deletedAt))
  },

  async getForEdit(id) {
    await latency()
    const o = getDb().opportunities.find((x) => x.id === id && !x.deletedAt)
    if (!o) throw notFound('La convocatoria')
    requireOwner(o)
    return clone(o)
  },

  async save(data, options) {
    await latency(200)
    return clone(savePublication('opportunity', data, options))
  },
}
