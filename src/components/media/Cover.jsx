import { Building2, Drama, Wrench, BookOpen, Megaphone, Video, Headphones, FileText, Book, GraduationCap, LayoutTemplate, Newspaper } from 'lucide-react'
import { cn } from '@/utils/format'

const ICONS = {
  venue: Building2, show: Drama, service: Wrench, resource: BookOpen, opportunity: Megaphone,
  video: Video, audio: Headphones, pdf: FileText, book: Book, course: GraduationCap, template: LayoutTemplate, article: Newspaper,
}

const TONES = {
  brand: 'var(--color-brand)',
  accent: 'var(--color-accent)',
  ink: '#3A3835',
  'brand-strong': 'var(--color-brand-strong)',
  'accent-strong': 'var(--color-accent-strong)',
}

// Tono estable a partir del texto: la misma sala siempre tiene el mismo color.
function toneFor(seed = '') {
  const keys = Object.keys(TONES)
  let n = 0
  for (const ch of seed) n = (n + ch.charCodeAt(0)) % 997
  return keys[n % keys.length]
}

// Imagen de portada. Si no hay foto, muestra el patrón de trama con un ícono:
// así la demo no usa fotos ajenas ni de stock sin licencia.
export function Cover({ src, alt, kind = 'venue', seed, tone, label, ratio = 'aspect-[4/3]', className }) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={cn('w-full object-cover', ratio, className)} />
  }
  const Icon = ICONS[kind] ?? BookOpen
  return (
    <div role="img" aria-label={alt}
      style={{ '--weave-bg': TONES[tone ?? toneFor(seed ?? alt)] }}
      className={cn('weave relative flex w-full items-center justify-center overflow-hidden text-white/90', ratio, className)}>
      <Icon aria-hidden className="size-10" strokeWidth={1.25} />
      {label && <span className="absolute bottom-3 left-3 font-serif text-sm italic text-white/80">{label}</span>}
    </div>
  )
}
