import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToData } from '@/services'

// Pide datos a un servicio y maneja carga, error y recarga. Vuelve a pedir
// cuando cambian `deps` o cuando cambian los datos (por ejemplo, después de
// guardar algo en otra parte de la app). Mientras recarga, conserva lo anterior.
export function useServiceQuery(fn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: enabled })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const runId = useRef(0)

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++runId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fnRef.current()
      if (id === runId.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (id === runId.current) setState((s) => ({ ...s, error, loading: false }))
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    run()
    return subscribeToData(() => run({ silent: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps])

  return { ...state, reload: run }
}
