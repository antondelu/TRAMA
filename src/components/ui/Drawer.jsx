import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/format'
import { useFocusTrap } from './useFocusTrap'

// Panel lateral: filtros en móvil y menú de navegación.
export function Drawer({ open, onClose, title, side = 'left', children, footer }) {
  const ref = useFocusTrap(open, onClose)
  const titleId = useId()
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/45" aria-hidden onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className={cn('absolute inset-y-0 flex w-[min(24rem,90vw)] flex-col bg-surface shadow-[var(--shadow-pop)]', side === 'left' ? 'left-0' : 'right-0')}>
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink-soft hover:bg-ink/5" aria-label="Cerrar">
            <X aria-hidden className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
