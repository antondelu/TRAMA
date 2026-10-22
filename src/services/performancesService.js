import cartelera from '@/data/cartelera/montevideo.json'
import { latency, clone } from './adapter/demoStore'
import { todayISO } from '@/utils/dates'

// Cartelera real de teatro de Montevideo, tomada de RedTickets y de Cartelera
// (Montevideo Portal) con `npm run cartelera`. No es dato de la demo: no se edita
// desde TRAMA y no vive en el almacenamiento local.

const MINUTE = 60_000
// Si la fuente no informa la duración, se asume una función de hora y media.
const DEFAULT_DURATION = 90

const places = new Map(cartelera.places.map((p) => [p.id, p]))

function expand(p) {
  // Uruguay no tiene horario de verano desde 2015: siempre -03:00.
  const startsAt = `${p.date}T${p.time}:00-03:00`
  const endsAt = new Date(new Date(startsAt).getTime() + (p.durationMinutes ?? DEFAULT_DURATION) * MINUTE).toISOString()
  return { ...p, startsAt, endsAt, place: places.get(p.placeId) }
}

// Funciones que todavía no terminaron, en orden de comienzo.
function upcoming(filter) {
  const now = Date.now()
  return cartelera.performances
    .filter(filter)
    .map(expand)
    .filter((p) => p.place && new Date(p.endsAt).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title, 'es'))
}

export const performancesService = {
  // Cuándo se bajó la cartelera y de dónde.
  source() {
    return { fetchedAt: cartelera.fetchedAt, names: ['RedTickets', 'Cartelera'] }
  },

  // Cartelera de un día. Si es hoy, las que ya terminaron no aparecen.
  async byDay(date = todayISO()) {
    await latency()
    return clone(upcoming((p) => p.date === date))
  },

  // Próximos días con la cantidad de funciones de cada uno, empezando hoy.
  async nextDays(count = 4) {
    await latency()
    const today = todayISO()
    const days = []
    for (let i = 0; i < count; i++) {
      const d = new Date(`${today}T00:00:00Z`)
      d.setUTCDate(d.getUTCDate() + i)
      const date = d.toISOString().slice(0, 10)
      days.push({ date, count: upcoming((p) => p.date === date).length })
    }
    return days
  },
}
