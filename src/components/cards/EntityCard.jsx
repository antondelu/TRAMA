import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Cover } from '@/components/media/Cover'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { cn } from '@/utils/format'
import { areaFor } from '@/constants/navigation'

// Estructura visual compartida por las tarjetas del catálogo. Cada tipo
// (sala, espectáculo, servicio...) decide qué datos poner adentro.
// Toda la tarjeta es clickeable a través del enlace del título.
// La imagen va a sangre arriba; las etiquetas quedan pegadas a su borde y una
// franja del color del área separa la imagen del texto.
export function EntityCard({ to, title, eyebrow, image, imageFocus, kind, icon, badges, children, footer, cta, favorite, className }) {
  return (
    <article className={cn('lift group relative flex flex-col border border-line bg-surface', areaFor(kind), className)}>
      <div className="relative overflow-hidden">
        <Cover src={image} focus={imageFocus} alt={title} kind={kind} icon={icon} seed={title} />
        {badges && <div className="absolute left-0 top-0 flex flex-wrap gap-px">{badges}</div>}
        {favorite && <FavoriteButton {...favorite} title={title} className="absolute right-0 top-0 z-10" />}
      </div>
      <div aria-hidden className="h-1.5 bg-[var(--area)]" />
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {eyebrow && <p className="eyebrow mb-1 !text-[var(--area-ink)]">{eyebrow}</p>}
        <h3 className="font-display text-xl font-bold leading-tight">
          <Link to={to} className="after:absolute after:inset-0 focus-visible:outline-none">{title}</Link>
        </h3>
        <div className="mt-2.5 flex-1 space-y-1.5">{children}</div>
        {(footer || cta) && (
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
            <div className="min-w-0">{footer}</div>
            {cta && (
              <span className="inline-flex size-10 shrink-0 items-center justify-center bg-ink text-white transition-colors group-hover:bg-[var(--area)] group-hover:text-[var(--area-on)]">
                <ArrowUpRight aria-hidden className="size-5" />
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
    <p className="data flex items-center gap-1.5 text-[0.95rem] text-ink">
      <Icon aria-hidden className="size-4 shrink-0 text-ink-soft" />
      <span className="truncate">{children}</span>
    </p>
  )
}
