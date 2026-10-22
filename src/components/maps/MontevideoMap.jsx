import { MAP_VIEW, MUNICIPALITIES, project } from '@/data/geo/montevideo'
import { cn, plural } from '@/utils/format'

// Referencias fijas para orientarse; las salas llevan su nombre al señalarlas.
const LANDMARKS = [
  { name: 'Ciudad Vieja', lon: -56.2075, lat: -34.9112 },
  { name: 'Centro', lon: -56.1915, lat: -34.9002 },
  { name: 'Cordón', lon: -56.1760, lat: -34.8975 },
  { name: 'Parque Rodó', lon: -56.1660, lat: -34.9128 },
  { name: 'Pocitos', lon: -56.1470, lat: -34.9025 },
  { name: 'Tres Cruces', lon: -56.1640, lat: -34.8905 },
  { name: 'Punta Carretas', lon: -56.1610, lat: -34.9262 },
]

const RIVER = project(-56.1880, -34.9205)

const inView = ({ x, y }) => x >= MAP_VIEW.x && x <= MAP_VIEW.x + MAP_VIEW.width && y >= MAP_VIEW.y && y <= MAP_VIEW.y + MAP_VIEW.height

// Mapa de Montevideo en SVG, sin teselas ni librerías: anda igual en la web y
// en las apps. `spots` son los lugares a marcar ({ id, name, lon, lat, live }).
export function MontevideoMap({ spots, activeId, onActivate, onToggle, ringColor = 'var(--color-area-shows-ink)', className }) {
  const { x, y, width, height } = MAP_VIEW
  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} role="group" aria-label="Mapa de Montevideo con los lugares que tienen función"
      className={cn('city-map', activeId && 'has-active', className)} style={{ '--spot-ring': ringColor }}>
      <defs>
        <pattern id="city-water" width="8" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 2 Q2 0.6 4 2 T8 2" fill="none" stroke="rgb(255 255 255 / 0.13)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill="url(#city-water)" />
      <g aria-hidden="true">
        {MUNICIPALITIES.map((m) => <path key={m.id} d={m.d} className="city-land" />)}
        {LANDMARKS.map((l) => {
          const p = project(l.lon, l.lat)
          return <text key={l.name} x={p.x} y={p.y} textAnchor="middle" className="city-label">{l.name}</text>
        })}
        <text x={RIVER.x} y={RIVER.y} textAnchor="middle" className="city-water-label">Río de la Plata</text>
      </g>
      {spots.map((s) => {
        const p = project(s.lon, s.lat)
        if (!inView(p)) return null
        const active = s.id === activeId
        // El nombre va hacia el lado con más lugar, para no salirse del recorte.
        const toLeft = p.x > x + width * 0.62
        return (
          <g key={s.id} role="button" tabIndex={0} aria-pressed={active}
            aria-label={`${s.name}, ${s.barrio}: ${plural(s.count, 'función', 'funciones')}`}
            className={cn('city-spot', active && 'is-active')}
            onMouseEnter={() => onActivate(s.id)} onMouseLeave={() => onActivate(null)}
            onFocus={() => onActivate(s.id)} onBlur={() => onActivate(null)}
            onClick={() => onToggle(s.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(s.id) }
            }}>
            {/* Área de toque más grande que el punto, para usar con el dedo. */}
            <circle cx={p.x} cy={p.y} r="9" fill="transparent" />
            {s.live && <circle cx={p.x} cy={p.y} r="4.5" className="spot-halo" />}
            <circle cx={p.x} cy={p.y} r={active ? 5.5 : 4} className="spot-dot" />
            <text x={toLeft ? p.x - 8 : p.x + 8} y={p.y + 3} textAnchor={toLeft ? 'end' : 'start'} className="spot-name">{s.name}</text>
          </g>
        )
      })}
    </svg>
  )
}
