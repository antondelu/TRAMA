import { formatPriceRange } from '@/utils/format'
import { cn } from '@/utils/format'

// Precio orientativo. Si no hay precio informado lo dice, sin inventar.
export function PriceDisplay({ from, to, currency = 'UYU', unit, emptyLabel = 'Precio a consultar', prefix = 'Desde', className }) {
  const text = formatPriceRange({ from, to: to ?? from, currency, unit })
  if (!text) return <span className={cn('text-sm text-ink-soft', className)}>{emptyLabel}</span>
  return (
    <span className={cn('text-sm', className)}>
      {to != null && to !== from ? null : <span className="text-ink-soft">{prefix} </span>}
      <span className="font-semibold text-ink">{text}</span>
    </span>
  )
}
