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
      className={cn('flex w-full flex-col gap-2 rounded-xl border border-line-strong bg-surface p-1.5 shadow-sm sm:flex-row sm:items-center', className)}>
      {showScope && (
        <label className="sm:w-44">
          <span className="sr-only">Buscar en</span>
          <select value={scope} onChange={(e) => setScope(e.target.value)}
            className={cn('w-full rounded-lg bg-canvas px-3 text-sm font-semibold focus:outline-none', big ? 'min-h-12' : 'min-h-10')}>
            {SEARCH_SCOPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      )}
      <div className="relative flex flex-1 items-center">
        <Search aria-hidden className="pointer-events-none absolute left-3 size-5 text-ink-soft" />
        <label htmlFor={`search-${size}`} className="sr-only">Término de búsqueda</label>
        <input id={`search-${size}`} type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Salas, obras, iluminación, residencias…"
          className={cn('w-full rounded-lg bg-transparent pl-10 pr-9 text-sm focus:outline-none', big ? 'min-h-12 sm:text-base' : 'min-h-10')} />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Limpiar búsqueda" className="absolute right-2 rounded p-1 text-ink-soft hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>
      <button type="submit" className={cn('rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong', big ? 'min-h-12' : 'min-h-10')}>
        Buscar
      </button>
    </form>
  )
}
