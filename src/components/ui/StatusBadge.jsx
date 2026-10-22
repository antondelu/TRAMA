import { CheckCircle2, Clock, XCircle, CircleDot, Archive, PauseCircle, AlertTriangle, Lock, Unlock, Ban } from 'lucide-react'
import { cn } from '@/utils/format'
import { PUBLICATION_STATES, OPPORTUNITY_STATES, REQUEST_STATE_LABELS } from '@/utils/workflows'

const TONES = {
  neutral: 'bg-ink/5 text-ink-soft border-line',
  brand: 'bg-brand-soft text-brand border-brand/20',
  accent: 'bg-accent-soft text-accent border-accent/20',
  success: 'bg-success-soft text-success border-success/25',
  warning: 'bg-warning-soft text-warning border-warning/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
  info: 'bg-info-soft text-info border-info/25',
  // Etiqueta de convocatoria abierta: el ámbar del área Convocatorias, con texto negro.
  convocatoria: 'bg-area-convocatorias text-ink border-transparent',
}

export function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap border px-2 py-0.5 text-sm font-bold', TONES[tone], className)}>
      {Icon && <Icon aria-hidden className="size-3.5" />}
      {children}
    </span>
  )
}

// Cada estado lleva texto e ícono, nunca solo color.
const STATUS = {
  draft: ['neutral', CircleDot],
  pending: ['warning', Clock],
  changes_requested: ['warning', AlertTriangle],
  published: ['success', CheckCircle2],
  inactive: ['neutral', PauseCircle],
  rejected: ['danger', XCircle],
  archived: ['neutral', Archive],
  closed: ['neutral', Ban],
  expired: ['neutral', Clock],
  sent: ['info', Clock],
  received: ['info', Clock],
  in_conversation: ['brand', CircleDot],
  under_review: ['warning', Clock],
  shortlisted: ['accent', CheckCircle2],
  accepted: ['success', CheckCircle2],
  cancelled: ['neutral', Ban],
  completed: ['accent', CheckCircle2],
  withdrawn: ['neutral', Ban],
}

const LABELS = { ...REQUEST_STATE_LABELS, ...PUBLICATION_STATES, ...OPPORTUNITY_STATES }

export function StatusBadge({ status, label, className }) {
  const [tone, icon] = STATUS[status] ?? ['neutral', CircleDot]
  return <Badge tone={tone} icon={icon} className={className}>{label ?? LABELS[status] ?? status}</Badge>
}

// Etiqueta de acceso de un recurso.
export function AccessBadge({ accessLevel }) {
  if (accessLevel === 'public') return <Badge tone="accent" icon={Unlock}>Gratuito</Badge>
  if (accessLevel === 'premium') return <Badge tone="brand" icon={Lock}>Membresía Profesional</Badge>
  return <Badge tone="brand" icon={Lock}>Miembros</Badge>
}
