import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Cover } from '@/components/media/Cover'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { cn } from '@/utils/format'

// Estructura visual compartida por las tarjetas del catálogo. Cada tipo
// (sala, espectáculo, servicio...) decide qué datos poner adentro.
// Toda la tarjeta es clickeable a través del enlace del título.
export function EntityCard({ to, title, eyebrow, image, kind, badges, children, footer, cta, favorite, className }) {
  return (
    <article className={cn('group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]', className)}>
      <div className="relative">
        <Cover src={image} alt={title} kind={kind} seed={title} className="transition-transform duration-300 group-hover:scale-[1.02]" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges}</div>}
        {favorite && <FavoriteButton {...favorite} title={title} className="absolute right-3 top-3 z-10" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link to={to} className="after:absolute after:inset-0 focus-visible:outline-none">{title}</Link>
        </h3>
        <div className="mt-2 flex-1 space-y-2 text-sm text-ink-soft">{children}</div>
        {(footer || cta) && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
            <div className="min-w-0">{footer}</div>
            {cta && (
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand">
                {cta}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
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
      <Icon aria-hidden className="size-4 shrink-0 text-ink-soft" />
      <span className="truncate">{children}</span>
    </p>
  )
}
