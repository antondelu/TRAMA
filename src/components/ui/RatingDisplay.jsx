import { Star, ShieldQuestion } from 'lucide-react'

// Valoración. TRAMA todavía no tiene un sistema de reseñas verificadas, así
// que sin `rating` explica eso en lugar de mostrar estrellas inventadas.
export function RatingDisplay({ rating = null, count = 0 }) {
  if (rating == null || !count) {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <ShieldQuestion aria-hidden className="size-4" />
        Sin reseñas verificadas todavía
      </p>
    )
  }
  return (
    <p className="inline-flex items-center gap-1.5 text-sm" aria-label={`${rating.toFixed(1)} de 5, ${count} reseñas verificadas`}>
      <Star aria-hidden className="size-4 fill-warning text-warning" />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-ink-soft">({count} reseñas verificadas)</span>
    </p>
  )
}
