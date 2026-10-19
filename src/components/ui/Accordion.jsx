import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/format'

export function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
          className="flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left font-semibold">
          {title}
          <ChevronDown aria-hidden className={cn('size-5 shrink-0 text-ink-soft transition-transform', open && 'rotate-180')} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-4 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  )
}

export function Accordion({ children, className }) {
  return <div className={cn('rounded-[var(--radius-card)] border border-line bg-surface px-5', className)}>{children}</div>
}
