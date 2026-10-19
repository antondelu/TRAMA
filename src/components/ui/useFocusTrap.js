import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Mantiene el foco dentro de un modal o drawer, cierra con Escape y devuelve
// el foco al elemento que lo abrió.
export function useFocusTrap(open, onClose) {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const node = ref.current
    const first = node?.querySelector('[data-autofocus]') ?? node?.querySelector(FOCUSABLE)
    ;(first ?? node)?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const firstItem = items[0]
      const last = items.at(-1)
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [open])

  return ref
}
