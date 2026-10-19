import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/format'
import { useFocusTrap } from './useFocusTrap'

const WIDTHS = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const ref = useFocusTrap(open, onClose)
  const titleId = useId()
  const descId = useId()
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/45" aria-hidden onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-surface shadow-[var(--shadow-pop)] sm:rounded-2xl', WIDTHS[size])}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-display text-xl font-semibold">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink-soft hover:bg-ink/5 hover:text-ink" aria-label="Cerrar">
            <X aria-hidden className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
