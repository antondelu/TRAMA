import { LOCALE } from '@/config/app'

export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}

const moneyFormatters = new Map()
export function formatMoney(amount, currency = LOCALE.currency) {
  if (amount == null) return null
  if (!moneyFormatters.has(currency)) {
    moneyFormatters.set(currency, new Intl.NumberFormat(LOCALE.language, {
      style: 'currency', currency, maximumFractionDigits: 0,
    }))
  }
  return moneyFormatters.get(currency).format(amount)
}

export function formatPriceRange({ from, to, currency, unit } = {}) {
  if (from == null && to == null) return null
  const a = formatMoney(from, currency)
  const b = formatMoney(to, currency)
  const range = a && b && from !== to ? `${a} – ${b}` : (a ?? b)
  return unit ? `${range} ${unit}` : range
}

const dateFmt = new Intl.DateTimeFormat(LOCALE.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortFmt = new Intl.DateTimeFormat(LOCALE.language, { day: 'numeric', month: 'short', timeZone: 'UTC' })

// Las fechas se guardan como 'YYYY-MM-DD' o ISO completo.
function toDate(value) {
  if (!value) return null
  return value.length === 10 ? new Date(`${value}T00:00:00Z`) : new Date(value)
}

export function formatDate(value) {
  const d = toDate(value)
  return d ? dateFmt.format(d) : ''
}

export function formatShortDate(value) {
  const d = toDate(value)
  return d ? shortFmt.format(d) : ''
}

export function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}
