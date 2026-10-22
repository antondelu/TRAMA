import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Cover } from './Cover'
import { cn } from '@/utils/format'
import { focusStyle } from '@/utils/image'

// Galería con miniaturas. Sin fotos cargadas muestra la portada de marca y lo aclara.
export function ImageGallery({ images = [], title, kind, icon, seed }) {
  const [index, setIndex] = useState(0)
  if (!images.length) {
    return (
      <figure>
        {/* Sin foto, una franja baja del color del área, sin texto: el nombre y los datos ya están en la ficha, justo debajo. */}
        <Cover kind={kind} icon={icon} seed={seed} label="" alt={`${title}: sin fotos cargadas`} ratio="aspect-[3/1] sm:aspect-[6/1]" className="rounded-[var(--radius-card)]" />
      </figure>
    )
  }
  const current = images[index]
  const go = (d) => setIndex((i) => (i + d + images.length) % images.length)
  return (
    <figure>
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <img src={current.url} alt={current.alt ?? `${title}, foto ${index + 1}`} style={focusStyle(current.focus)} className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 bg-surface/90 p-2"><ChevronLeft aria-hidden className="size-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface/90 p-2"><ChevronRight aria-hidden className="size-5" /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.url} type="button" onClick={() => setIndex(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === index}
              className={cn('shrink-0 overflow-hidden rounded-md border-2', i === index ? 'border-brand' : 'border-transparent')}>
              <img src={img.url} alt="" style={focusStyle(img.focus)} className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
      {current.credit && <figcaption className="mt-1 text-xs text-ink-soft">Foto: {current.credit}</figcaption>}
    </figure>
  )
}
