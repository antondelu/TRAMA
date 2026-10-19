import { Link } from 'react-router-dom'
import { cn } from '@/utils/format'

// Logotipo tipográfico: TRAMA en serif, con la "trama" de tres hilos.
export function Logo({ className, inverted = false }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2', className)} aria-label="TRAMA, ir al inicio">
      <svg aria-hidden viewBox="0 0 24 24" className="size-6">
        <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.8" className={inverted ? 'text-white' : 'text-brand'} />
        <path d="M8 3v18M16 3v18" stroke="currentColor" strokeWidth="1.8" className={inverted ? 'text-white/50' : 'text-accent'} />
      </svg>
      <span className={cn('font-serif text-2xl font-semibold tracking-[0.18em]', inverted ? 'text-white' : 'text-ink')}>TRAMA</span>
    </Link>
  )
}
