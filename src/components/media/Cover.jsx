import { Building2, Ticket, Wrench, BookOpen, Megaphone, Video, Headphones, FileText, Book, GraduationCap, LayoutTemplate, Newspaper } from 'lucide-react'
import { cn } from '@/utils/format'
import { focusStyle } from '@/utils/image'
import { areaFor } from '@/constants/navigation'

const ICONS = {
  venue: Building2, show: Ticket, service: Wrench, resource: BookOpen, opportunity: Megaphone,
  video: Video, audio: Headphones, pdf: FileText, book: Book, course: GraduationCap, template: LayoutTemplate, article: Newspaper,
}

// Variación estable a partir del nombre: la misma publicación siempre tiene
// el mismo tono y la misma dirección de hilos, y dos vecinas casi nunca coinciden.
const SHADES = ['0%', '12%', '22%']
const WEAVES = ['35deg', '62deg', '118deg', '145deg']
function variantFor(seed = '') {
  let n = 0
  for (const ch of seed) n = (n * 31 + ch.charCodeAt(0)) % 9973
  return { '--shade': SHADES[n % SHADES.length], '--weave': WEAVES[Math.floor(n / 3) % WEAVES.length] }
}

// Imagen de portada. Sin foto, es un plano del color del área con el nombre
// en tipografía grande, como un cartel: la publicación se reconoce por su
// nombre y su área, sin usar fotos ajenas ni de stock sin licencia.
// `focus` es el encuadre que eligió quien subió la foto (ver utils/image.js).
// `icon` reemplaza al ícono del tipo (ej. el de la especialidad de un servicio).
// `label` (opcional) es el texto grande; si no, se usa `seed` o `alt`.
export function Cover({ src, alt, kind = 'venue', icon, seed, label, focus, ratio = 'aspect-[4/3]', className }) {
  if (src) {
    return (
      <div className={cn('w-full overflow-hidden bg-ink/5', ratio, className)}>
        <img src={src} alt={alt} loading="lazy" style={focusStyle(focus)} className="size-full object-cover" />
      </div>
    )
  }
  const Icon = icon ?? ICONS[kind] ?? BookOpen
  const text = label ?? seed ?? alt
  return (
    <div role="img" aria-label={alt} style={variantFor(seed ?? alt)}
      className={cn('cover-art relative flex w-full flex-col justify-end overflow-hidden p-4 [container-type:inline-size]', areaFor(kind), ratio, className)}>
      {/* El ícono va abajo a la derecha: arriba quedan las etiquetas y el botón de favorito de las tarjetas. */}
      <Icon aria-hidden className="absolute bottom-4 right-4 size-6 opacity-80" strokeWidth={1.75} />
      {/* El tamaño sale del ancho de la portada (cqi): el nombre entra entero en una tarjeta y crece en una ficha. */}
      <span aria-hidden className="line-clamp-3 pr-10 font-display text-[clamp(1.25rem,9cqi,3.25rem)] font-extrabold uppercase leading-[0.92] [font-stretch:112%] [overflow-wrap:break-word]">
        {text}
      </span>
    </div>
  )
}
