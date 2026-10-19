import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Los filtros viven en la URL (?ciudad=...&page=2), así se pueden compartir
// y el botón "atrás" funciona. Cambiar un filtro vuelve a la página 1.
export function useUrlFilters(keys) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const out = {}
    for (const key of keys) out[key] = params.get(key) ?? ''
    out.page = params.get('page') ?? '1'
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const update = useCallback((changes, { resetPage = true } = {}) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value === '' || value == null || (Array.isArray(value) && !value.length)) next.delete(key)
        else next.set(key, Array.isArray(value) ? value.join(',') : String(value))
      }
      if (resetPage && !('page' in changes)) next.delete('page')
      return next
    }, { replace: true })
  }, [setParams])

  // Limpia los filtros; por defecto conserva la búsqueda y el orden.
  const clear = useCallback(({ keepQuery = true } = {}) => {
    setParams((prev) => {
      const next = new URLSearchParams()
      if (keepQuery) for (const k of ['q', 'sort']) if (prev.get(k)) next.set(k, prev.get(k))
      return next
    }, { replace: true })
  }, [setParams])

  const activeCount = keys.filter((k) => k !== 'q' && k !== 'sort' && filters[k]).length

  return { filters, update, clear, activeCount }
}
