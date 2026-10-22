import { Building2, Ticket, Wrench, BookOpen, Megaphone, Newspaper } from 'lucide-react'

// Las cuatro áreas principales de TRAMA, más Convocatorias. `area` es la clase
// de color de cada una (ver .area-* en styles/index.css).
export const CATEGORIES = [
  {
    id: 'salas', label: 'Salas', to: '/salas', icon: Building2, area: 'area-salas',
    description: 'Espacios para presentar, ensayar y producir. Con fichas técnicas y disponibilidad.',
  },
  {
    id: 'espectaculos', label: 'Espectáculos', to: '/espectaculos', icon: Ticket, area: 'area-shows',
    description: 'Obras y propuestas disponibles para programación, giras y temporadas.',
  },
  {
    id: 'servicios', label: 'Servicios', to: '/servicios', icon: Wrench, area: 'area-servicios',
    description: 'Profesionales y proveedores: técnica, diseño, producción, comunicación y más.',
  },
  {
    id: 'recursos', label: 'Recursos', to: '/recursos', icon: BookOpen, area: 'area-recursos',
    description: 'Biblioteca profesional: guías, entrevistas, plantillas y formación.',
  },
]

export const OPPORTUNITIES_NAV = {
  id: 'oportunidades', label: 'Convocatorias', to: '/oportunidades', icon: Megaphone, area: 'area-convocatorias',
  description: 'Convocatorias de salas, festivales, instituciones y programadores.',
}

export const NEWS_NAV = {
  id: 'noticias', label: 'Noticias', to: '/noticias', icon: Newspaper, area: 'area-noticias',
  description: 'Noticias de artes escénicas de Uruguay y del mundo.',
}

export const SEARCH_SCOPES = [
  { id: 'all', label: 'Todo TRAMA' },
  { id: 'salas', label: 'Salas', to: '/salas' },
  { id: 'espectaculos', label: 'Espectáculos', to: '/espectaculos' },
  { id: 'servicios', label: 'Servicios', to: '/servicios' },
  { id: 'oportunidades', label: 'Convocatorias', to: '/oportunidades' },
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
  opportunity: 'Convocatoria',
  resource: 'Recurso',
}

// Clase de color de cada tipo de publicación. Los formatos de recurso (video,
// pdf...) también son Recursos.
const RESOURCE_KINDS = ['resource', 'video', 'audio', 'pdf', 'book', 'course', 'template', 'article']
export function areaFor(kind) {
  if (kind === 'venue') return 'area-salas'
  if (kind === 'show') return 'area-shows'
  if (kind === 'service') return 'area-servicios'
  if (kind === 'opportunity') return 'area-convocatorias'
  if (kind === 'news') return 'area-noticias'
  if (RESOURCE_KINDS.includes(kind)) return 'area-recursos'
  return 'area-noticias'
}
