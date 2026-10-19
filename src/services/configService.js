// Catálogos configurables (disciplinas, especialidades, tipos de sala...).
import { getDb, commit, latency, clone } from './adapter/demoStore'
import { requirePermission } from './access'
import { invalid } from './errors'
import { COUNTRIES } from '@/constants/taxonomies'
import { slugify } from '@/utils/slug'

export const EDITABLE_TAXONOMIES = {
  disciplines: 'Disciplinas',
  genres: 'Géneros',
  specialties: 'Especialidades de servicios',
  venueTypes: 'Tipos de espacio',
  equipment: 'Equipamiento técnico',
  opportunityTypes: 'Tipos de oportunidad',
  resourceCategories: 'Categorías de recursos',
}

export const configService = {
  // Lectura sincrónica: los formularios y filtros la necesitan al renderizar.
  taxonomies() {
    return getDb().taxonomies
  },

  countries() {
    return COUNTRIES
  },

  async addValue(key, label) {
    await latency(120)
    requirePermission('admin:config')
    const list = getDb().taxonomies[key]
    if (!list || !EDITABLE_TAXONOMIES[key]) throw invalid('Catálogo no editable.')
    const clean = String(label ?? '').trim()
    if (clean.length < 2) throw invalid('Escribí un nombre de al menos 2 caracteres.')
    const id = slugify(clean)
    if (list.some((x) => x.id === id)) throw invalid('Ese valor ya existe.')
    list.push({ id, label: clean })
    commit()
    return clone(list)
  },
}
