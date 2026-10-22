import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { SEARCH_SCOPES } from '@/constants/navigation'
import { cn } from '@/utils/format'

// Buscador global: elegir categoría (o todo TRAMA) y enviar.
// "Todo TRAMA" va a /buscar; una categoría va a su catálogo con ?q=.
export function SearchBar({ initialQuery = '', initialScope = 'all', size = 'md', className, showScope = true }) {
  const [q, setQ] = useState(initialQuery)
  const [scope, setScope] = useState(initialScope)
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    const term = q.trim()
    const target = SEARCH_SCOPES.find((s) => s.id === scope)
    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (!target?.to) {
      if (scope !== 'all') params.set('en', scope)
      navigate(`/buscar?${params}`)
    } else {
      navigate(`${target.to}${term ? `?${params}` : ''}`)
    }
  }

  const big = size === 'lg'
  return (
    <form role="search" onSubmit={onSubmit}
      className={cn('flex w-full flex-col border-2 border-ink bg-surface text-ink sm:flex-row sm:items-stretch', className)}>
      {showScope && (
        <label className="border-b-2 border-ink sm:w-44 sm:border-b-0 sm:border-r-2">
          <span className="sr-only">Buscar en</span>
          <select value={scope} onChange={(e) => setScope(e.target.value)}
            className={cn('size-full bg-canvas px-4 text-base font-bold focus:outline-none sm:text-sm', big ? 'min-h-14' : 'min-h-11')}>
            {SEARCH_SCOPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      )}
      <div className="relative flex flex-1 items-center">
        <Search aria-hidden className="pointer-events-none absolute left-3 size-5 text-ink-soft" />
        <label htmlFor={`search-${size}`} className="sr-only">Término de búsqueda</label>
        <input id={`search-${size}`} type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Salas, obras, iluminación, residencias…"
          className={cn('w-full bg-transparent pl-10 pr-9 text-base focus:outline-none', big ? 'min-h-14 sm:text-lg' : 'min-h-11')} />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Limpiar búsqueda" className="absolute right-2 rounded p-1 text-ink-soft hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>
      <button type="submit" className={cn('bg-brand px-7 text-base font-bold text-white transition-colors hover:bg-accent', big ? 'min-h-14' : 'min-h-11')}>
        Buscar
      </button>
    </form>
  )
}
