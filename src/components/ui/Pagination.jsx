import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/format'

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  const btn = 'inline-flex size-11 items-center justify-center rounded-lg border text-sm font-semibold transition-colors'
  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-1.5">
      <button type="button" className={cn(btn, 'border-line bg-surface disabled:opacity-40')} disabled={page <= 1}
        onClick={() => onChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
          className={cn(btn, p === page ? 'border-brand bg-brand text-white' : 'border-line bg-surface hover:border-ink')}>
          <span className="sr-only">Página </span>{p}
        </button>
      ))}
      <button type="button" className={cn(btn, 'border-line bg-surface disabled:opacity-40')} disabled={page >= pageCount}
        onClick={() => onChange(page + 1)} aria-label="Página siguiente">
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  )
}
