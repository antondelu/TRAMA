import { useRef } from 'react'
import { cn } from '@/utils/format'

// Escenario a oscuras con un foco de luz cálida. Con mouse, el foco sigue
// suavemente al puntero; en pantallas táctiles o con "reducir movimiento"
// queda fijo en el centro.
export function Stage({ as: Tag = 'section', follow = true, className, children, ...props }) {
  const ref = useRef(null)
  const frame = useRef(0)

  function onPointerMove(e) {
    if (!follow || e.pointerType !== 'mouse') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      // El foco se mueve, pero sin alejarse demasiado del centro.
      const x = 50 + ((e.clientX - r.left) / r.width - 0.5) * 60
      const y = 45 + ((e.clientY - r.top) / r.height - 0.5) * 30
      el.style.setProperty('--sx', `${x}%`)
      el.style.setProperty('--sy', `${y}%`)
    })
  }

  function onPointerLeave() {
    ref.current?.style.removeProperty('--sx')
    ref.current?.style.removeProperty('--sy')
  }

  return (
    <Tag ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={cn('stage', className)} {...props}>
      <div aria-hidden className="stage-beam" />
      <div aria-hidden className="stage-pool" />
      <div aria-hidden className="stage-edge" />
      {children}
    </Tag>
  )
}
