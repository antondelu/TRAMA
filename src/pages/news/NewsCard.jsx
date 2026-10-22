import { useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { LogoMark } from '@/components/navigation/Logo'
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

// Hilos ondulados que se cruzan, como el nudo del logo: el tejido de fondo
// de la imagen de respaldo.
const THREADS = Array.from({ length: 7 }, (_, i) => {
  const y = 14 + i * 12
  const dir = i % 2 ? -1 : 1
  return `M-10 ${y} C 40 ${y - 9 * dir}, 80 ${y + 9 * dir}, 130 ${y} S 220 ${y - 9 * dir}, 250 ${y}`
})

// Sin imagen del medio: el logo de TRAMA sobre un tejido de hilos.
function NewsFallback({ className }) {
  return (
    <div aria-hidden className={cn('relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden bg-brand-strong', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,var(--color-accent-strong)_0,transparent_60%),radial-gradient(circle_at_85%_90%,var(--color-brand)_0,transparent_55%)] opacity-80" />
      <svg viewBox="0 0 240 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {THREADS.map((d) => <path key={d} d={d} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />)}
      </svg>
      <LogoMark inverted className="relative size-12 drop-shadow-[0_6px_16px_rgb(0_0_0/0.35)]" />
      <span className="relative font-display text-2xl font-bold tracking-tight text-white">trama</span>
    </div>
  )
}

// Imagen del medio si la publica en su feed; si no hay o no carga, el logo de
// TRAMA. Sin referrer, para no enviarle al medio desde qué página se pidió.
function NewsImage({ item, className }) {
  const [failed, setFailed] = useState(false)
  if (!item.image || failed) return <NewsFallback className={className} />
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
            <span className="inline-flex items-center gap-1 bg-brand-soft px-2.5 py-1 font-semibold text-brand">
              <MapPin aria-hidden className="size-3.5" />{place}
            </span>
          )}
          {item.disciplines.map((d) => <span key={d.id} className="bg-canvas px-2.5 py-1 font-semibold text-ink-soft">{d.label}</span>)}
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand" aria-hidden>
            Leer en la fuente <ExternalLink className="size-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
