import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { StatusBadge, Badge } from '@/components/ui/StatusBadge'
import { DataList } from '@/components/ui/Card'
import { RequestActions } from './RequestActions'
import { RequestThread } from './RequestThread'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { ENTITY_ROUTES } from '@/constants/navigation'
import { stateLabelFor } from '@/utils/workflows'
import { formatDate, formatMoney, formatShortDate, cn } from '@/utils/format'

function details(r, label) {
  switch (r.kind) {
    case 'booking': return [
      { label: 'Fecha', value: formatDate(r.date) },
      { label: 'Franja', value: label('timeSlots', r.timeSlot) },
      { label: 'Actividad', value: label('activityTypes', r.activityType) },
      { label: 'Funciones', value: String(r.functionCount) },
      { label: 'Fecha propuesta por la sala', value: r.proposedDate ? formatDate(r.proposedDate) : null },
    ]
    case 'venueInquiry': return []
    case 'showInquiry': return [
      { label: 'Organización', value: r.organization }, { label: 'Sala o festival', value: r.venueName },
      { label: 'Fechas estimadas', value: r.requestedDates }, { label: 'Funciones', value: String(r.functionCount) },
    ]
    case 'serviceInquiry': return [
      { label: 'Proyecto', value: r.projectType }, { label: 'Fecha aproximada', value: r.requestedDate ? formatDate(r.requestedDate) : null },
      { label: 'Ubicación', value: r.location }, { label: 'Presupuesto', value: r.budget ? formatMoney(r.budget) : 'No indicado' },
    ]
    // El mensaje, la propuesta o la descripción del proyecto abren la conversación.
    default: return []
  }
}

export function RequestItem({ request: r }) {
  const [open, setOpen] = useState(false)
  const [focusReply, setFocusReply] = useState(false)
  const replyRef = useRef(null)
  useEffect(() => {
    if (open && focusReply) { replyRef.current?.focus(); setFocusReply(false) }
  }, [open, focusReply])
  const reply = () => { setOpen(true); setFocusReply(true) }
  const { label } = useTaxonomies()
  const facts = details(r, label)
  const received = r.side === 'receiver'
  const DirectionIcon = received ? ArrowDownLeft : ArrowUpRight
  const openConflicts = r.conflicts.filter((c) => c.status !== 'accepted')
  const acceptedConflict = r.conflicts.find((c) => c.status === 'accepted')

  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <span className={cn('mt-0.5 inline-flex size-8 shrink-0 items-center justify-center', received ? 'bg-accent-soft text-accent' : 'bg-brand-soft text-brand')}>
          <DirectionIcon aria-hidden className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-soft">
            <strong className="font-semibold text-ink">{r.directionLabel}</strong> · {r.kindLabel} · {received ? `de ${r.senderName}` : `a ${r.counterpartName}`} · {formatShortDate(r.updatedAt.slice(0, 10))}
          </p>
          <p className="font-semibold">
            {r.entitySlug ? <Link to={ENTITY_ROUTES[r.entityType](r.entitySlug)} className="hover:text-brand hover:underline">{r.entityTitle}</Link> : r.entityTitle}
            {r.kind === 'booking' && <span className="font-normal text-ink-soft"> · {formatDate(r.date)}</span>}
          </p>
          {r.kind === 'booking' && received && (openConflicts.length > 0 || acceptedConflict) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-warning">
              <AlertTriangle aria-hidden className="size-4" />
              {acceptedConflict ? 'Ya hay una reserva aceptada para esta fecha.' : `Hay ${openConflicts.length} otra${openConflicts.length > 1 ? 's' : ''} solicitud${openConflicts.length > 1 ? 'es' : ''} para la misma fecha.`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status === 'sent' && received ? 'received' : r.status} label={r.stateLabel} />
        </div>
      </div>
      <div className="space-y-3 px-4 pb-4">
        <RequestActions request={r} onReply={reply} />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-brand hover:underline">
          {open ? 'Ocultar conversación y detalles' : `Ver conversación${r.thread.length ? ` (${r.thread.length})` : ''} y detalles`}
          <ChevronDown aria-hidden className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div className="space-y-5 border-t border-line px-4 py-4">
          <RequestThread ref={replyRef} request={r} />
          {facts.length > 0 && <DataList items={facts} />}
          {r.history?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">Historial</h3>
              <ol className="mt-2 space-y-1.5 text-sm">
                {r.history.map((h, i) => (
                  <li key={i} className="flex flex-wrap gap-x-2 text-ink-soft">
                    <span>{formatShortDate(h.at.slice(0, 10))}</span>
                    <Badge>{stateLabelFor(h.to, r.side)}</Badge>
                    {h.note && <span>— {h.note}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </li>
  )
}
