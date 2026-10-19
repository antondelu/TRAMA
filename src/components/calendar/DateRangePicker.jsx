import { Calendar } from './Calendar'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils/format'

// Selección de una fecha o un rango sobre el calendario.
export function DateRangePicker({ value, onChange, days, canSelect, onMonthChange, single = false, loading }) {
  const summary = !value?.start
    ? (single ? 'Elegí una fecha en el calendario.' : 'Elegí la fecha de inicio y luego la de fin.')
    : value.end && value.end !== value.start
      ? `Del ${formatDate(value.start)} al ${formatDate(value.end)}`
      : `${formatDate(value.start)}${single ? '' : ' — elegí la fecha de fin o dejala así para un solo día'}`
  return (
    <div className="space-y-3">
      <Calendar mode={single ? 'single' : 'range'} selected={value} onSelect={onChange} days={days}
        canSelect={canSelect} onMonthChange={onMonthChange} loading={loading} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm" aria-live="polite">{summary}</p>
        {value?.start && <Button variant="ghost" size="sm" onClick={() => onChange({ start: null, end: null })}>Limpiar selección</Button>}
      </div>
    </div>
  )
}
