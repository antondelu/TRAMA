import { Link } from 'react-router-dom'
import { cn } from '@/utils/format'

// Logotipo: "trama" en minúscula y bold, con un nudo de dos hilos que se cruzan.
export function Logo({ className, inverted = false }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2', className)} aria-label="TRAMA, ir al inicio">
      <svg aria-hidden viewBox="0 0 28 28" className="size-7">
        <rect width="28" height="28" rx="9" className={inverted ? 'fill-white' : 'fill-brand'} />
        <path d="M7 11.5c4.5-3 9.5 3 14 0M7 16.5c4.5 3 9.5-3 14 0" fill="none" strokeWidth="2.2" strokeLinecap="round"
          className={inverted ? 'stroke-brand' : 'stroke-white'} />
      </svg>
      <span className={cn('font-display text-2xl font-bold tracking-tight', inverted ? 'text-white' : 'text-ink')}>trama</span>
    </Link>
  )
}
