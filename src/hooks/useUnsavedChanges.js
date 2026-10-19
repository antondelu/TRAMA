import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

// Avisa antes de salir de un formulario con cambios sin guardar: tanto al
// navegar dentro de la app como al cerrar o recargar la pestaña.
// Devuelve el blocker para mostrar un ConfirmDialog propio.
// `bypassRef.current = true` deja salir (por ejemplo, justo después de guardar).
export function useUnsavedChanges(isDirty, bypassRef) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && !bypassRef?.current && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!isDirty) return undefined
    const onBeforeUnload = (e) => {
      if (bypassRef?.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty, bypassRef])

  return blocker
}
