import { Building2, Drama, Wrench, BookOpen, Megaphone, Video, Headphones, FileText, Book, GraduationCap, LayoutTemplate, Newspaper } from 'lucide-react'
import { cn } from '@/utils/format'
import { focusStyle } from '@/utils/image'

const ICONS = {
  venue: Building2, show: Drama, service: Wrench, resource: BookOpen, opportunity: Megaphone,
  video: Video, audio: Headphones, pdf: FileText, book: Book, course: GraduationCap, template: LayoutTemplate, article: Newspaper,
}

// Combinaciones de la paleta: fondo, dos luces y color del ícono.
export const COVER_TONES = {
  night: { base: '#263A52', glow: '#3E6A96', glow2: '#192839', fg: 'rgb(255 255 255 / 0.9)' },
  steel: { base: '#3E6A96', glow: '#7FA7CF', glow2: '#263A52', fg: 'rgb(255 255 255 / 0.92)' },
  sky: { base: '#DCE6F1', glow: '#FFFFFF', glow2: '#B8CCE2', fg: '#263A52' },
  ivory: { base: '#ECE7DD', glow: '#FFFFFF', glow2: '#DCD3C3', fg: '#263A52' },
  deep: { base: '#192839', glow: '#2C5078', glow2: '#263A52', fg: 'rgb(255 255 255 / 0.88)' },
}

// Tono estable a partir del texto: la misma sala siempre tiene el mismo color.
function toneFor(seed = '') {
  const keys = Object.keys(COVER_TONES)
  let n = 0
  for (const ch of seed) n = (n + ch.charCodeAt(0)) % 997
  return keys[n % keys.length]
}

// Imagen de portada. Sin foto, muestra un degradé de la paleta con un ícono:
// así la demo no usa fotos ajenas ni de stock sin licencia.
// `focus` es el encuadre que eligió quien subió la foto (ver utils/image.js).
// `icon` reemplaza al ícono del tipo (ej. el de la especialidad de un servicio).
export function Cover({ src, alt, kind = 'venue', icon, seed, tone, label, focus, ratio = 'aspect-[4/3]', className }) {
  if (src) {
    return (
      <div className={cn('w-full overflow-hidden', ratio, className)}>
        <img src={src} alt={alt} loading="lazy" style={focusStyle(focus)} className="size-full object-cover" />
      </div>
    )
  }
  const Icon = icon ?? ICONS[kind] ?? BookOpen
  const t = COVER_TONES[tone] ?? COVER_TONES[toneFor(seed ?? alt)]
  return (
    <div role="img" aria-label={alt}
      style={{ '--cover-base': t.base, '--cover-glow': t.glow, '--cover-glow-2': t.glow2, color: t.fg }}
      className={cn('cover-art relative flex w-full items-center justify-center overflow-hidden', ratio, className)}>
      <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
        <Icon aria-hidden className="size-8" strokeWidth={1.5} />
      </span>
      {label && <span className="absolute bottom-3 left-4 font-display text-sm font-semibold opacity-80">{label}</span>}
    </div>
  )
}
