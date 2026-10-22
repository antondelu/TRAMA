import { Link } from 'react-router-dom'
import { cn } from '@/utils/format'

// Ícono del logo: un nudo de dos hilos que se cruzan, en un cuadrado recto.
export function LogoMark({ className = 'size-7', inverted = false }) {
  return (
    <svg aria-hidden viewBox="0 0 28 28" className={className}>
      <rect width="28" height="28" className={inverted ? 'fill-white' : 'fill-brand'} />
      <path d="M6 11.5c5-3.2 11 3.2 16 0M6 16.5c5 3.2 11-3.2 16 0" fill="none" strokeWidth="2.6" strokeLinecap="square"
        className={inverted ? 'stroke-night' : 'stroke-white'} />
    </svg>
  )
}

// Logotipo: "trama" en minúscula y bold, junto al ícono.
export function Logo({ className, inverted = false }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2', className)} aria-label="TRAMA, ir al inicio">
      <LogoMark inverted={inverted} />
      <span className={cn('font-display text-[1.65rem] font-extrabold leading-none tracking-[-0.03em] [font-stretch:125%]', inverted ? 'text-white' : 'text-ink')}>trama</span>
    </Link>
  )
}
