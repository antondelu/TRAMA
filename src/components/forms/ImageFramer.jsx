import { useId, useRef } from 'react'
import { Move, RotateCcw } from 'lucide-react'
import { DEFAULT_FOCUS, focusStyle } from '@/utils/image'
import { cn } from '@/utils/format'

const clamp = (n) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10
const STEP = 2

// Encuadre de una foto dentro del recuadro donde se va a ver (por defecto, la
// tarjeta del catálogo). Se arrastra con el mouse o el dedo para ubicarla, se
// acerca con el zoom, y con el teclado se mueve con las flechas.
export function ImageFramer({ image, ratio = 'aspect-[4/3]', label, onChange, className }) {
  const zoomId = useId()
  const frameRef = useRef(null)
  const drag = useRef(null)
  const focus = { ...DEFAULT_FOCUS, ...image.focus }

  function onPointerDown(e) {
    const img = frameRef.current.querySelector('img')
    if (!img?.naturalWidth) return
    const frame = frameRef.current.getBoundingClientRect()
    // Cuánto sobra la foto en cada eje cuando cubre el recuadro: es el recorrido
    // que tiene para moverse de un borde al otro.
    const cover = Math.max(frame.width / img.naturalWidth, frame.height / img.naturalHeight) * focus.zoom
    drag.current = {
      x: e.clientX, y: e.clientY, start: focus,
      extraX: img.naturalWidth * cover - frame.width, extraY: img.naturalHeight * cover - frame.height,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    onChange({
      ...focus,
      x: d.extraX > 1 ? clamp(d.start.x - ((e.clientX - d.x) / d.extraX) * 100) : d.start.x,
      y: d.extraY > 1 ? clamp(d.start.y - ((e.clientY - d.y) / d.extraY) * 100) : d.start.y,
    })
  }

  function onKeyDown(e) {
    const moves = { ArrowLeft: ['x', -STEP], ArrowRight: ['x', STEP], ArrowUp: ['y', -STEP], ArrowDown: ['y', STEP] }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    onChange({ ...focus, [move[0]]: clamp(focus[move[0]] + move[1]) })
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>}
      <div ref={frameRef} tabIndex={0} role="slider" aria-roledescription="encuadre"
        aria-label={`Encuadre de ${image.name ?? 'la foto'}. Arrastrá la foto o usá las flechas para ubicarla.`}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={focus.x} aria-valuetext={`${Math.round(focus.x)}% horizontal, ${Math.round(focus.y)}% vertical`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
        onKeyDown={onKeyDown}
        className={cn('group relative cursor-grab touch-none select-none overflow-hidden rounded-[calc(var(--radius-card)-0.375rem)] bg-canvas outline-offset-2 active:cursor-grabbing', ratio)}>
        <img src={image.url} alt="" draggable={false} style={focusStyle(focus)} className="pointer-events-none size-full object-cover" />
        <span aria-hidden className="pointer-events-none absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap bg-black/55 px-3 py-1 text-xs font-medium text-white opacity-90 transition-opacity group-active:opacity-0">
          <Move className="size-3.5" /> Arrastrá para ubicarla
        </span>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor={zoomId} className="text-sm font-semibold">Zoom</label>
        <input id={zoomId} type="range" min={1} max={3} step={0.05} value={focus.zoom}
          onChange={(e) => onChange({ ...focus, zoom: Number(e.target.value) })} className="flex-1 accent-brand" />
        <button type="button" onClick={() => onChange({ ...DEFAULT_FOCUS })}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-ink-soft hover:text-brand">
          <RotateCcw aria-hidden className="size-3.5" /> Centrar
        </button>
      </div>
    </div>
  )
}
