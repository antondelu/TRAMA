import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Cover } from '@/components/media/Cover'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { cn } from '@/utils/format'

// Estructura visual compartida por las tarjetas del catálogo. Cada tipo
// (sala, espectáculo, servicio...) decide qué datos poner adentro.
// Toda la tarjeta es clickeable a través del enlace del título.
export function EntityCard({ to, title, eyebrow, image, kind, badges, children, footer, cta, favorite, className }) {
  return (
    <article className={cn('lift group relative flex flex-col rounded-[var(--radius-card)] bg-surface p-2 shadow-[var(--shadow-card)]', className)}>
      <div className="relative overflow-hidden rounded-[calc(var(--radius-card)-0.375rem)]">
        <Cover src={image} alt={title} kind={kind} seed={title} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges}</div>}
        {favorite && <FavoriteButton {...favorite} title={title} className="absolute right-3 top-3 z-10" />}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h3 className="font-display text-xl font-semibold leading-tight">
          <Link to={to} className="after:absolute after:inset-0 focus-visible:outline-none">{title}</Link>
        </h3>
        <div className="mt-2.5 flex-1 space-y-1.5 text-sm text-ink-soft">{children}</div>
        {(footer || cta) && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">{footer}</div>
            {cta && (
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only">{cta}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

// Fila de dato con ícono dentro de una tarjeta.
export function CardMeta({ icon: Icon, children }) {
  if (children == null || children === '') return null
  return (
    <p className="flex items-center gap-1.5">
      <Icon aria-hidden className="size-4 shrink-0 text-ink-soft/80" />
      <span className="truncate">{children}</span>
    </p>
  )
}
