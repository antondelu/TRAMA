import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/format'
import { WEEKDAYS, addMonths, monthGrid, monthLabel, todayISO, toISO } from '@/utils/dates'
import { formatDate } from '@/utils/format'
import { DAY_STATUS } from './calendarStatus'

export function CalendarLegend({ statuses = Object.keys(DAY_STATUS) }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft" aria-label="Referencias del calendario">
      {statuses.map((key) => {
        const s = DAY_STATUS[key]
        const Icon = s.icon
        return (
          <li key={key} className="flex items-center gap-1.5">
            <span className={cn('inline-flex size-5 items-center justify-center rounded border', s.cell.replace('line-through', ''))}>
              <Icon aria-hidden className="size-3" />
            </span>
            {s.label}
          </li>
        )
      })}
    </ul>
  )
}

// Calendario mensual.
// - days: { 'YYYY-MM-DD': { status, notes } } — lo que falta es "sin información"
// - mode: 'view' | 'single' | 'range'
// - selected: { start, end }  (en single, start === end)
// - canSelect(date, status): decide si una fecha se puede elegir
// - onMonthChange({ from, to }): para pedir los datos del mes visible
export function Calendar({ days = {}, mode = 'view', selected, onSelect, canSelect, onMonthChange, initialMonth, minDate = todayISO(), loading = false }) {
  const [month, setMonth] = useState(() => {
    const base = initialMonth ?? todayISO()
    return { year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 }
  })
  const cells = useMemo(() => monthGrid(month.year, month.month), [month])
  const from = toISO(month.year, month.month, 1)
  const to = cells.filter(Boolean).at(-1)

  useEffect(() => {
    onMonthChange?.({ from, to })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

  function isSelected(date) {
    if (!selected?.start) return false
    const end = selected.end ?? selected.start
    return date >= selected.start && date <= end
  }

  function pick(date, status) {
    if (mode === 'view' || !onSelect) return
    if (mode === 'single' || !selected?.start || selected.end) return onSelect({ start: date, end: null }, status)
    if (date < selected.start) return onSelect({ start: date, end: null }, status)
    return onSelect({ start: selected.start, end: date }, status)
  }

  return (
    <div className="select-none" aria-busy={loading || undefined}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} className="rounded-lg p-2 hover:bg-ink/5" aria-label="Mes anterior">
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <h3 className="font-display text-lg font-semibold" aria-live="polite">{monthLabel(month.year, month.month)}</h3>
        <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} className="rounded-lg p-2 hover:bg-ink/5" aria-label="Mes siguiente">
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
      <div role="grid" aria-label={`Disponibilidad de ${monthLabel(month.year, month.month)}`} className={cn('grid grid-cols-7 gap-1', loading && 'opacity-60')}>
        {WEEKDAYS.map((d) => <div key={d} role="columnheader" className="pb-1 text-center text-xs font-semibold text-ink-soft">{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} role="gridcell" aria-hidden />
          const info = days[date]
          const status = info?.status ?? 'unknown'
          const meta = DAY_STATUS[status] ?? DAY_STATUS.unknown
          const Icon = meta.icon
          const past = date < minDate
          const selectable = mode !== 'view' && !past && (canSelect ? canSelect(date, status) : true)
          const chosen = isSelected(date)
          const label = `${formatDate(date)}: ${meta.label}${info?.notes ? ` (${info.notes})` : ''}${chosen ? ', seleccionada' : ''}`
          const classes = cn('flex aspect-square w-full flex-col items-center justify-center rounded-md border text-xs font-semibold sm:text-sm',
            meta.cell, past && 'opacity-45', chosen && 'ring-2 ring-brand ring-offset-1',
            selectable ? 'cursor-pointer hover:brightness-95' : 'cursor-default')
          const inner = (
            <>
              <span>{Number(date.slice(8))}</span>
              <Icon aria-hidden className="mt-0.5 hidden size-3 sm:block" />
            </>
          )
          return (
            <div key={date} role="gridcell">
              {mode === 'view' ? (
                <div aria-label={label} title={label} className={classes}>{inner}</div>
              ) : (
                <button type="button" disabled={!selectable} aria-label={label} aria-pressed={chosen}
                  onClick={() => pick(date, status)} title={label} className={classes}>
                  {inner}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
