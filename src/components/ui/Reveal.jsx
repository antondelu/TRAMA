import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/format'

// Hace aparecer su contenido con un desplazamiento suave cuando entra en
// pantalla. `delay` (ms) sirve para escalonar elementos de una grilla.
// Sin IntersectionObserver (navegadores viejos, pruebas) se muestra directo.
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible || !ref.current) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag ref={ref} style={{ '--d': `${delay}ms` }} className={cn('reveal', visible && 'is-visible', className)} {...props}>
      {children}
    </Tag>
  )
}
