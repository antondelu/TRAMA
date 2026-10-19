import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/format'

const TONES = {
  success: ['border-success/30', CheckCircle2, 'text-success'],
  danger: ['border-danger/30', AlertCircle, 'text-danger'],
  info: ['border-info/30', Info, 'text-info'],
}

export function Toast({ title, description, tone = 'success', onDismiss }) {
  const [border, Icon, color] = TONES[tone] ?? TONES.info
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-4 shadow-[var(--shadow-pop)]', border)}>
      <Icon aria-hidden className={cn('mt-0.5 size-5 shrink-0', color)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      <button type="button" onClick={onDismiss} aria-label="Cerrar aviso" className="rounded p-1 text-ink-soft hover:text-ink">
        <X aria-hidden className="size-4" />
      </button>
    </div>
  )
}
