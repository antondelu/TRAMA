import { useCallback, useEffect, useState } from 'react'
import { AccountHeader } from './AccountLayout'
import { Calendar, CalendarLegend } from '@/components/calendar/Calendar'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { FormField, Input, Select } from '@/components/forms/FormField'
import { RequestItem } from '@/features/inquiries/RequestItem'
import { venuesService, requestsService, subscribeToData } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { datesBetween } from '@/utils/dates'
import { formatDate } from '@/utils/format'

const MARKS = [
  { id: 'available', label: 'Marcar como disponible' },
  { id: 'blocked', label: 'Bloquear' },
  { id: 'internal', label: 'Evento interno' },
  { id: 'unknown', label: 'Quitar información' },
]

function ManageDates({ venueId }) {
  const { success, error: showError } = useToast()
  const [days, setDays] = useState({})
  const [visible, setVisible] = useState(null)
  const [range, setRange] = useState({ start: null, end: null })
  const [mark, setMark] = useState('available')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (r = visible) => {
    if (!r) return
    setDays(await venuesService.getAvailability(venueId, r.from, r.to))
  }, [venueId, visible])

  useEffect(() => { load() }, [load])
  useEffect(() => subscribeToData(() => load()), [load])

  // Fechas con solicitudes pendientes o reservas confirmadas no se pueden pisar.
  const locked = (s) => ['pending', 'confirmed'].includes(s)

  async function apply() {
    const dates = datesBetween(range.start, range.end ?? range.start).filter((d) => !locked(days[d]?.status))
    if (!dates.length) return showError('No hay fechas para cambiar', 'Las fechas elegidas tienen solicitudes o reservas.')
    setSaving(true)
    try {
      await venuesService.setDates(venueId, dates, mark, note.trim() || null)
      success('Calendario actualizado', `${dates.length} ${dates.length === 1 ? 'fecha' : 'fechas'}`)
      setRange({ start: null, end: null })
      setNote('')
    } catch (e) {
      showError('No se pudo actualizar', e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
      <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <Calendar mode="range" days={days} selected={range} onSelect={setRange} onMonthChange={setVisible} />
        <CalendarLegend />
      </div>
      <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-semibold">Cambiar fechas</h2>
        <p className="text-sm text-ink-soft" aria-live="polite">
          {range.start ? `Seleccionado: ${formatDate(range.start)}${range.end && range.end !== range.start ? ` al ${formatDate(range.end)}` : ''}` : 'Elegí una fecha o un rango en el calendario.'}
        </p>
        <FormField label="Acción"><Select options={MARKS} value={mark} onChange={(e) => setMark(e.target.value)} /></FormField>
        {mark === 'internal' && <FormField label="Nota del evento" hint="Solo la ves vos."><Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} /></FormField>}
        <Button className="w-full" disabled={!range.start} loading={saving} onClick={apply}>Aplicar</Button>
        <p className="text-sm text-ink-soft">Las fechas con solicitudes pendientes o reservas confirmadas no cambian: resolvé primero la solicitud.</p>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  useDocumentTitle('Calendario')
  const venues = useServiceQuery(() => venuesService.listMine(), [])
  const [venueId, setVenueId] = useState('')
  const current = venueId || venues.data?.[0]?.id
  const bookings = useServiceQuery(() => requestsService.listForVenue(current), [current], { enabled: Boolean(current) })

  if (venues.error) return <ErrorState error={venues.error} onRetry={venues.reload} />
  if (!venues.data) return <LoadingSkeleton variant="detail" />
  if (!venues.data.length) return <EmptyState title="No tenés salas" description="Registrá una sala para gestionar su calendario." action={<Button to="/publicar/sala">Registrar una sala</Button>} />

  const open = bookings.data?.filter((b) => ['sent', 'in_conversation'].includes(b.status)) ?? []
  const rest = bookings.data?.filter((b) => !['sent', 'in_conversation'].includes(b.status)) ?? []

  return (
    <>
      <AccountHeader title="Calendario y reservas" description="Gestioná la disponibilidad de tus salas y respondé solicitudes."
        actions={venues.data.length > 1 && (
          <label className="text-sm">
            <span className="sr-only">Sala</span>
            <select value={current} onChange={(e) => setVenueId(e.target.value)} className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 font-semibold">
              {venues.data.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
        )} />
      <DemoNotice className="mb-5">Modo demo: las reservas no son reales. En producción, el servidor tiene que impedir dobles reservas aunque dos personas acepten a la vez.</DemoNotice>
      <ManageDates key={current} venueId={current} />
      <section className="mt-10" aria-labelledby="pend-title">
        <h2 id="pend-title" className="mb-3 font-display text-2xl font-semibold">Solicitudes por responder ({open.length})</h2>
        {bookings.error ? <ErrorState error={bookings.error} onRetry={bookings.reload} /> : !bookings.data ? <LoadingSkeleton variant="list" count={2} />
          : open.length ? <ul className="space-y-3">{open.map((r) => <RequestItem key={r.id} request={r} />)}</ul>
            : <p className="text-sm text-ink-soft">No hay solicitudes pendientes para esta sala.</p>}
      </section>
      {rest.length > 0 && (
        <section className="mt-10" aria-labelledby="hist-title">
          <h2 id="hist-title" className="mb-3 font-display text-2xl font-semibold">Historial</h2>
          <ul className="space-y-3">{rest.map((r) => <RequestItem key={r.id} request={r} />)}</ul>
        </section>
      )}
    </>
  )
}
