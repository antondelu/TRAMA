import { useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { Cover } from '@/components/media/Cover'
import { LOCALE } from '@/config/app'
import { cn } from '@/utils/format'

const dateFmt = new Intl.DateTimeFormat(LOCALE.language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: LOCALE.timezone })

// Una fecha ilegible no debe tirar abajo la página: se omite.
function formatNewsDate(iso) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d)
}

function placeLabel(item) {
  if (item.country === 'UY') {
    if (item.city && item.city !== item.department) return `${item.city}, ${item.department}`
    return item.department ?? 'Uruguay'
  }
  return [item.city, item.countryName].filter(Boolean).join(', ') || null
}

// Imagen del medio si la publica en su feed; si no hay o no carga, la portada
// de marca. Sin referrer, para no enviarle al medio desde qué página se pidió.
function NewsImage({ item, className }) {
  const [failed, setFailed] = useState(false)
  if (!item.image || failed) return <Cover alt="" kind="article" seed={item.source.name} className={className} ratio="aspect-[16/9]" />
  return (
    <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)}
      className={cn('aspect-[16/9] w-full object-cover', className)} />
  )
}

// Tarjeta de una noticia. El título enlaza a la publicación original, que se
// abre en otra pestaña; la fuente queda siempre visible.
export function NewsCard({ item, featured = false }) {
  const place = placeLabel(item)
  return (
    <article className={cn('group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]',
      featured && 'md:col-span-2 md:flex-row')}>
      <div className={cn('overflow-hidden', featured && 'md:w-1/2 md:shrink-0')}>
        <NewsImage item={item} className={cn('transition-transform duration-500 group-hover:scale-[1.03]', featured && 'md:h-full')} />
      </div>
      <div className={cn('flex flex-1 flex-col p-5', featured && 'md:p-7')}>
        <p className="eyebrow">
          <span className="text-ink">{item.source.name}</span>
          {' · '}
          <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
        </p>
        <h3 className={cn('mt-2 font-display font-semibold leading-tight', featured ? 'text-2xl md:text-3xl' : 'text-lg')}>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="after:absolute after:inset-0 hover:underline focus-visible:outline-none">
            {item.title}
            <span className="sr-only"> (se abre en una pestaña nueva, en {item.source.name})</span>
          </a>
        </h3>
        {item.summary && <p className={cn('mt-2 text-sm text-ink-soft', featured ? 'line-clamp-5 md:text-base' : 'line-clamp-3')}>{item.summary}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 text-xs">
          {place && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">
              <MapPin aria-hidden className="size-3.5" />{place}
            </span>
          )}
          {item.disciplines.map((d) => <span key={d.id} className="rounded-full bg-canvas px-2.5 py-1 font-semibold text-ink-soft">{d.label}</span>)}
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand" aria-hidden>
            Leer en la fuente <ExternalLink className="size-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
