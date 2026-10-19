import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Cover } from './Cover'
import { cn } from '@/utils/format'

// Galería con miniaturas. Sin fotos cargadas muestra la portada de marca y lo aclara.
export function ImageGallery({ images = [], title, kind, seed }) {
  const [index, setIndex] = useState(0)
  if (!images.length) {
    return (
      <figure>
        <Cover kind={kind} seed={seed} alt={`${title}: sin fotografías cargadas`} ratio="aspect-[16/9] sm:aspect-[21/9]" className="rounded-[var(--radius-card)]" />
        <figcaption className="mt-2 text-xs text-ink-soft">Todavía no hay fotografías cargadas para esta publicación.</figcaption>
      </figure>
    )
  }
  const current = images[index]
  const go = (d) => setIndex((i) => (i + d + images.length) % images.length)
  return (
    <figure>
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <img src={current.url} alt={current.alt ?? `${title}, foto ${index + 1}`} className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2"><ChevronLeft aria-hidden className="size-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2"><ChevronRight aria-hidden className="size-5" /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.url} type="button" onClick={() => setIndex(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === index}
              className={cn('shrink-0 overflow-hidden rounded-md border-2', i === index ? 'border-brand' : 'border-transparent')}>
              <img src={img.url} alt="" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
      {current.credit && <figcaption className="mt-1 text-xs text-ink-soft">Foto: {current.credit}</figcaption>}
    </figure>
  )
}
