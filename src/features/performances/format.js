import { LOCALE } from '@/config/app'
import { daysUntil } from '@/utils/dates'
import { formatMoney } from '@/utils/format'

const weekdayFmt = new Intl.DateTimeFormat(LOCALE.language, { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
const longFmt = new Intl.DateTimeFormat(LOCALE.language, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// "Hoy", "Mañana" o "Vie 23".
export function dayLabel(date, today) {
  const diff = daysUntil(date, today)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return capitalize(weekdayFmt.format(new Date(`${date}T00:00:00Z`)).replace('.', '').replace(',', ''))
}

export function longDayLabel(date) {
  return capitalize(longFmt.format(new Date(`${date}T00:00:00Z`)))
}

export function ticketPrice(p) {
  if (p.soldOut) return 'Agotado'
  if (p.priceFrom === 0) return 'Entrada libre'
  return p.priceFrom == null ? 'Precio en boletería' : `Desde ${formatMoney(p.priceFrom)}`
}

const updatedFmt = new Intl.DateTimeFormat(LOCALE.language, { day: 'numeric', month: 'long', timeZone: LOCALE.timezone })
export const updatedLabel = (iso) => updatedFmt.format(new Date(iso))

// Estado relativo a ahora: en escena, por empezar o nada.
export function liveStatus(p, now) {
  const start = new Date(p.startsAt).getTime()
  const end = new Date(p.endsAt).getTime()
  if (now >= start && now < end) return { live: true, label: 'En escena' }
  const minutes = Math.round((start - now) / 60_000)
  if (minutes > 0 && minutes <= 60) return { live: false, label: `Empieza en ${minutes} min` }
  return null
}
