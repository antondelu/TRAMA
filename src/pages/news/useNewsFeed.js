import { useCallback, useEffect, useRef, useState } from 'react'
import { newsService } from '@/services'

// Una sección de noticias con "Cargar más": la primera página se vuelve a
// pedir cuando cambian los filtros; las siguientes se agregan al final.
export function useNewsFeed(section, { discipline, location }) {
  const [state, setState] = useState({ items: [], page: 0, hasMore: false, total: 0, facets: null, lastSuccessAt: null, loading: true, loadingMore: false, error: null, failedPage: null })
  const controller = useRef(null)

  const load = useCallback(async (page) => {
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    setState((s) => ({ ...s, error: null, loading: page === 1, loadingMore: page > 1 }))
    try {
      const data = await newsService.list({ section, discipline, location, page }, { signal: ctrl.signal })
      setState((s) => {
        const seen = new Set(page === 1 ? [] : s.items.map((it) => it.id))
        const items = page === 1 ? data.items : [...s.items, ...data.items.filter((it) => !seen.has(it.id))]
        return { items, page, hasMore: data.hasMore, total: data.total, facets: data.facets, lastSuccessAt: data.lastSuccessAt, loading: false, loadingMore: false, error: null, failedPage: null }
      })
    } catch (error) {
      if (error?.name === 'AbortError') return
      setState((s) => ({ ...s, loading: false, loadingMore: false, error, failedPage: page }))
    }
  }, [section, discipline, location])

  useEffect(() => {
    load(1)
    return () => controller.current?.abort()
  }, [load])

  return { ...state, loadMore: () => load(state.page + 1), retry: () => load(state.failedPage ?? 1) }
}
