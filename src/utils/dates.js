import { LOCALE } from '@/config/app'

// Fecha de hoy en la zona horaria del mercado, como 'YYYY-MM-DD'.
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LOCALE.timezone }).format(new Date())
}

export function isPastDate(iso, today = todayISO()) {
  return Boolean(iso) && iso < today
}

export function daysUntil(iso, today = todayISO()) {
  const ms = new Date(`${iso}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

export function toISO(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function addMonths({ year, month }, delta) {
  const d = new Date(Date.UTC(year, month + delta, 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
}

// Grilla de un mes empezando en lunes. Las celdas fuera del mes son null.
export function monthGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= days; d++) cells.push(toISO(year, month, d))
  while (cells.length % 7) cells.push(null)
  return cells
}

export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function monthLabel(year, month) {
  const label = new Intl.DateTimeFormat(LOCALE.language, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month, 1)))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function datesBetween(from, to) {
  const out = []
  const end = new Date(`${to}T00:00:00Z`)
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
