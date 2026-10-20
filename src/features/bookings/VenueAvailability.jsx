import { useCallback, useState } from 'react'
import { CalendarSearch } from 'lucide-react'
import { DateRangePicker } from '@/components/calendar/DateRangePicker'
import { CalendarLegend } from '@/components/calendar/Calendar'
import { DAY_STATUS } from '@/components/calendar/calendarStatus'
import { Button } from '@/components/ui/Button'
import { venuesService } from '@/services'
import { datesBetween } from '@/utils/dates'
import { formatDate } from '@/utils/format'

// Calendario público de una sala con consulta de disponibilidad.
// Las fechas sin información NO se presentan como libres.
export function VenueAvailability({ venueId, onRequest }) {
  const [days, setDays] = useState({})
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ start: null, end: null })
  const [result, setResult] = useState(null)

  const loadMonth = useCallback(async ({ from, to }) => {
    setLoading(true)
    const map = await venuesService.getAvailability(venueId, from, to)
    setDays((prev) => ({ ...prev, ...map }))
    setLoading(false)
  }, [venueId])

  async function check() {
    const end = range.end ?? range.start
    const map = await venuesService.getAvailability(venueId, range.start, end)
    const dates = datesBetween(range.start, end)
    const summary = dates.reduce((acc, d) => {
      const s = map[d]?.status ?? 'unknown'
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {})
    setResult({ dates, summary, allFree: summary.available === dates.length })
  }

  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <DateRangePicker value={range} onChange={(v) => { setRange(v); setResult(null) }} days={days} onMonthChange={loadMonth} loading={loading} />
      <CalendarLegend />
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button variant="secondary" icon={CalendarSearch} disabled={!range.start} onClick={check}>Consultar disponibilidad</Button>
        {onRequest && <Button disabled={!range.start} onClick={() => onRequest(range.start)}>Solicitar reserva{range.start ? ` para el ${formatDate(range.start)}` : ''}</Button>}
      </div>
      {result && (
        <div role="status" className="rounded-lg bg-canvas p-3 text-sm">
          {result.allFree
            ? <p className="font-semibold text-success">Todas las fechas elegidas figuran como disponibles.</p>
            : <p className="font-semibold">No todas las fechas están libres:</p>}
          <ul className="mt-1 space-y-0.5 text-ink-soft">
            {Object.entries(result.summary).map(([s, n]) => <li key={s}>{DAY_STATUS[s].label}: {n} {n === 1 ? 'día' : 'días'}</li>)}
          </ul>
          <p className="mt-2 text-sm text-ink-soft">La disponibilidad la informa la sala. Una solicitud no es una reserva hasta que la sala la acepta.</p>
        </div>
      )}
    </div>
  )
}
