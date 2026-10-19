import { useId } from 'react'
import { cn } from '@/utils/format'

// Reloj de arena chiquito: la arena cae de arriba hacia abajo y el reloj se da
// vuelta para empezar de nuevo. Estilos en styles/index.css (.hourglass).
// Con "reducir movimiento" queda quieto.
export function Hourglass({ className }) {
  const clip = useId()
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('hourglass size-4 shrink-0', className)}>
      <defs>
        <clipPath id={clip}><rect className="hourglass-level" x="6" y="5" width="12" height="7" /></clipPath>
      </defs>
      <path className="hourglass-sand" clipPath={`url(#${clip})`} d="M8.3 5.5h7.4C15.2 8.6 13.3 10.3 12 12c-1.3-1.7-3.2-3.4-3.7-6.5Z" />
      <path className="hourglass-stream" d="M12 12v7.5" />
      <path className="hourglass-sand hourglass-pile" d="M8 20.2c.9-2.4 2.6-3.5 4-3.5s3.1 1.1 4 3.5Z" />
      <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M5 3h14M5 21h14M7 3c0 5 3.8 7 5 9-1.2 2-5 4-5 9M17 3c0 5-3.8 7-5 9 1.2 2 5 4 5 9" />
    </svg>
  )
}
