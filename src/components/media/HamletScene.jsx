import { cn } from '@/utils/format'

// Hamlet en silueta, bajo el foco: sostiene la calavera, duda y cae de
// rodillas. Cada parte del cuerpo es un grupo que gira sobre su articulación
// (ver .hamlet-* en styles/index.css). Con "reducir movimiento" se ve
// directamente la pose final.
export function HamletScene({ className }) {
  return (
    <svg viewBox="0 0 240 300" aria-hidden className={cn('hamlet overflow-visible', className)}>
      <defs>
        <radialGradient id="hamlet-floor">
          <stop offset="0%" stopColor="rgb(255 241 214)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(255 241 214)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Círculo del foco sobre las tablas y la sombra del actor */}
      <ellipse cx="125" cy="291" rx="125" ry="14" fill="url(#hamlet-floor)" />
      <ellipse className="hamlet-shadow" cx="112" cy="291" rx="40" ry="4" />

      {/* Pierna de atrás */}
      <g className="hamlet-thigh-back">
        <path d="M88 168 h14 l-1 58 a6 6 0 0 1 -12 0 z" />
        <g className="hamlet-shin-back">
          <path d="M89 226 a6 6 0 0 1 12 0 l-2 56 h-7 z" />
          <path d="M91 280 h9 q10 0 14 8 v2 h-23 z" />
        </g>
      </g>

      <g className="hamlet-body">
        {/* Capa, detrás del cuerpo */}
        <path d="M86 98 q-14 6 -18 40 q-6 50 -18 92 q16 4 30 -4 q4 -60 14 -110 z" />
        {/* Brazo de atrás: la mano en el pecho */}
        <g className="hamlet-arm-back">
          <path d="M84 100 h12 l-1 32 a5 5 0 0 1 -10 0 z" />
          <g className="hamlet-forearm-back">
            <path d="M85 132 a5 5 0 0 1 10 0 l-1 28 a4 4 0 0 1 -8 0 z" />
          </g>
        </g>
        {/* Torso: jubón con faldón */}
        <path d="M84 96 q18 -6 34 0 l-2 66 q8 6 8 16 h-48 q0 -10 8 -16 z" />
        {/* Gorguera */}
        <ellipse cx="101" cy="95" rx="16" ry="5" />
        <g className="hamlet-head">
          <rect x="96" y="80" width="10" height="14" rx="3" />
          <circle cx="102" cy="70" r="13" />
          <path d="M89 68 q0 -16 14 -16 q12 0 13 10 q-8 -4 -14 2 q-6 -4 -13 4 z" />
          <path d="M114 69 l4 4 l-4 1 z" />
        </g>
        {/* Brazo de adelante: alza la calavera */}
        <g className="hamlet-arm-front">
          <path d="M106 100 h12 l-1 32 a5 5 0 0 1 -10 0 z" />
          <g className="hamlet-forearm-front">
            <path d="M107 132 a5 5 0 0 1 10 0 l-1 28 a4 4 0 0 1 -8 0 z" />
            <circle cx="112" cy="163" r="5" />
          </g>
        </g>
      </g>

      {/* Pierna de adelante */}
      <g className="hamlet-thigh-front">
        <path d="M100 168 h14 l-1 58 a6 6 0 0 1 -12 0 z" />
        <g className="hamlet-shin-front">
          <path d="M101 226 a6 6 0 0 1 12 0 l-2 56 h-7 z" />
          <path d="M103 280 h9 q10 0 14 8 v2 h-23 z" />
        </g>
      </g>

      {/* Calavera de Yorick: empieza en la mano y rueda por el piso */}
      <g className="hamlet-skull">
        <path d="M160 68 a11 10 0 0 1 22 0 q0 8 -4 10 v5 h-14 v-5 q-4 -2 -4 -10 z" />
        <circle className="hamlet-socket" cx="167" cy="70" r="2.6" />
        <circle className="hamlet-socket" cx="175" cy="70" r="2.6" />
      </g>
    </svg>
  )
}
