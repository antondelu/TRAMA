import { FlaskConical } from 'lucide-react'
import { cn } from '@/utils/format'

// Aviso de modo demo en lugares donde algo podría confundirse con real
// (reservas, pagos, ingreso, mensajes).
export function DemoNotice({ children, className }) {
  return (
    <p className={cn('flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft px-3 py-2 text-sm text-warning', className)}>
      <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
