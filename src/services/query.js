// Ayudas para búsquedas, filtros y paginación del modo demo. Cuando haya una
// API, estos parámetros se envían tal cual como query string.

import { PAGE_SIZE } from '@/config/app'

export function normalize(text = '') {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Cada palabra del término tiene que aparecer en alguno de los campos.
export function matchesText(q, fields) {
  if (!q?.trim()) return true
  const haystack = normalize(fields.flat().filter(Boolean).join(' '))
  return normalize(q).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word))
}

// Relevancia simple: coincidencias en el título valen más.
export function relevance(q, title, rest = []) {
  if (!q?.trim()) return 0
  const words = normalize(q).split(/\s+/).filter(Boolean)
  const t = normalize(title)
  const r = normalize(rest.flat().filter(Boolean).join(' '))
  return words.reduce((score, w) => score + (t.includes(w) ? 3 : 0) + (r.includes(w) ? 1 : 0), 0)
}

export function toList(value) {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value : String(value).split(',').filter(Boolean)
}

export function toNumber(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function paginate(items, page = 1, pageSize = PAGE_SIZE) {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    total, page: current, pageCount, pageSize,
  }
}

export const byText = (key) => (a, b) => a[key].localeCompare(b[key], 'es')

// Ordena con precio nulo siempre al final.
export function byPrice(direction) {
  return (a, b) => {
    if (a.priceFrom == null && b.priceFrom == null) return 0
    if (a.priceFrom == null) return 1
    if (b.priceFrom == null) return -1
    return direction === 'asc' ? a.priceFrom - b.priceFrom : b.priceFrom - a.priceFrom
  }
}

export const isPublic = (item) => item.publicationStatus === 'published' && !item.deletedAt
