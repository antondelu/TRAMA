// DATOS DE DEMOSTRACIÓN. Disponibilidad de salas (VenueAvailability).
// Se genera de forma determinística (siempre el mismo resultado) a partir del
// id de la sala y la fecha, para no tener cientos de líneas escritas a mano.
// Las fechas fuera del rango cargado quedan como "sin información".

import { datesBetween } from '@/utils/dates'

function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Cada sala tiene un rango con datos y una proporción de días bloqueados.
const RANGES = {
  'v-urdimbre': { from: '2026-10-01', to: '2027-02-28', blocked: 0.35 },
  'v-telar': { from: '2026-10-01', to: '2027-01-31', blocked: 0.5 },
  'v-bastidor': { from: '2026-10-15', to: '2027-03-31', blocked: 0.3 },
  'v-ovillo': { from: '2026-10-01', to: '2026-12-31', blocked: 0.2 },
  'v-lanzadera': { from: '2026-11-01', to: '2027-03-31', blocked: 0.4 },
  'v-proscenio': { from: '2026-12-01', to: '2027-03-31', blocked: 0.25 },
  // Sala Tramoya Norte no cargó disponibilidad: todas sus fechas son "sin información".
}

export function buildAvailability() {
  const rows = []
  for (const [venueId, range] of Object.entries(RANGES)) {
    for (const date of datesBetween(range.from, range.to)) {
      const roll = (hash(`${venueId}:${date}`) % 1000) / 1000
      rows.push({
        id: `av-${venueId}-${date}`,
        venueId,
        startDateTime: `${date}T09:00:00-03:00`,
        endDateTime: `${date}T23:59:00-03:00`,
        date,
        status: roll < range.blocked ? 'blocked' : 'available',
        notes: null,
        updatedAt: '2026-10-01T12:00:00Z',
      })
    }
  }
  // Fechas de las solicitudes de ejemplo: la sala las había marcado libres.
  const freeDates = [['v-urdimbre', '2026-11-21'], ['v-urdimbre', '2026-12-05'], ['v-telar', '2026-11-08'], ['v-telar', '2026-11-15'], ['v-bastidor', '2027-01-16']]
  for (const [venueId, date] of freeDates) {
    const row = rows.find((r) => r.venueId === venueId && r.date === date)
    if (row) row.status = 'available'
  }
  // Eventos internos registrados por la responsable de Sala Urdimbre.
  for (const [date, note] of [['2026-10-30', 'Mantenimiento de parrilla'], ['2026-11-14', 'Función propia de la sala']]) {
    const row = rows.find((r) => r.venueId === 'v-urdimbre' && r.date === date)
    if (row) Object.assign(row, { status: 'internal', notes: note })
  }
  return rows
}
