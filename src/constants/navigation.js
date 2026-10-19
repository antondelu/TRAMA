import { Building2, Drama, Wrench, BookOpen, Megaphone } from 'lucide-react'

// Las cuatro áreas principales de TRAMA, más Oportunidades.
export const CATEGORIES = [
  {
    id: 'salas', label: 'Salas', to: '/salas', icon: Building2, tone: 'brand',
    description: 'Espacios para presentar, ensayar y producir. Con fichas técnicas y disponibilidad.',
  },
  {
    id: 'espectaculos', label: 'Espectáculos', to: '/espectaculos', icon: Drama, tone: 'accent',
    description: 'Obras y propuestas disponibles para programación, giras y temporadas.',
  },
  {
    id: 'servicios', label: 'Servicios', to: '/servicios', icon: Wrench, tone: 'ink',
    description: 'Profesionales y proveedores: técnica, diseño, producción, comunicación y más.',
  },
  {
    id: 'recursos', label: 'Recursos', to: '/recursos', icon: BookOpen, tone: 'brand-strong',
    description: 'Biblioteca profesional: guías, entrevistas, plantillas y formación.',
  },
]

export const OPPORTUNITIES_NAV = {
  id: 'oportunidades', label: 'Oportunidades', to: '/oportunidades', icon: Megaphone,
  description: 'Convocatorias de salas, festivales, instituciones y programadores.',
}

export const SEARCH_SCOPES = [
  { id: 'all', label: 'Todo TRAMA' },
  { id: 'salas', label: 'Salas', to: '/salas' },
  { id: 'espectaculos', label: 'Espectáculos', to: '/espectaculos' },
  { id: 'servicios', label: 'Servicios', to: '/servicios' },
  { id: 'oportunidades', label: 'Oportunidades', to: '/oportunidades' },
  { id: 'recursos', label: 'Recursos', to: '/recursos' },
]

export const ENTITY_ROUTES = {
  venue: (slug) => `/salas/${slug}`,
  show: (slug) => `/espectaculos/${slug}`,
  service: (slug) => `/servicios/${slug}`,
  opportunity: (slug) => `/oportunidades/${slug}`,
  resource: (slug) => `/recursos/${slug}`,
}

export const ENTITY_LABELS = {
  venue: 'Sala',
  show: 'Espectáculo',
  service: 'Servicio',
  opportunity: 'Oportunidad',
  resource: 'Recurso',
}
