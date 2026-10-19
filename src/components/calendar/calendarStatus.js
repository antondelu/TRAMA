import { Check, X, Clock, CalendarCheck, Star, Minus } from 'lucide-react'

// Estados de fecha. Cada uno tiene texto e ícono además de color.
export const DAY_STATUS = {
  available: { label: 'Disponible', icon: Check, cell: 'bg-success-soft text-success border-success/30', dot: 'bg-success' },
  pending: { label: 'Solicitud pendiente', icon: Clock, cell: 'bg-warning-soft text-warning border-warning/30', dot: 'bg-warning' },
  confirmed: { label: 'Reservada', icon: CalendarCheck, cell: 'bg-info-soft text-info border-info/30', dot: 'bg-info' },
  blocked: { label: 'Bloqueada', icon: X, cell: 'bg-ink/[0.06] text-ink-soft border-line line-through', dot: 'bg-ink-soft' },
  internal: { label: 'Evento interno', icon: Star, cell: 'bg-brand-soft text-brand border-brand/25', dot: 'bg-brand' },
  unknown: { label: 'Sin información', icon: Minus, cell: 'bg-surface text-ink-soft/70 border-dashed border-line', dot: 'bg-line-strong' },
}
