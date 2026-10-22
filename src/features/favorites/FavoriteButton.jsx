import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useFavorites } from './FavoritesContext'
import { cn } from '@/utils/format'

// Guardar / quitar de favoritos. Sin sesión, lleva a ingresar y vuelve acá.
export function FavoriteButton({ type, id, title, variant = 'icon', className }) {
  const { user } = useAuth()
  const { isFavorite, toggle } = useFavorites()
  const { success, error, info } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const saved = isFavorite(type, id)
  const label = saved ? `Quitar ${title} de favoritos` : `Guardar ${title} en favoritos`

  async function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      info('Iniciá sesión para guardar favoritos')
      navigate(`/ingresar?volver=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    setBusy(true)
    try {
      const added = await toggle(type, id)
      success(added ? 'Guardado en favoritos' : 'Quitado de favoritos', title)
    } catch (err) {
      error('No pudimos actualizar tus favoritos', err.message)
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'button') {
    return (
      <button type="button" onClick={onClick} disabled={busy} aria-pressed={saved}
        className={cn('inline-flex min-h-11 items-center gap-2 border-2 px-4 text-sm font-bold transition-colors',
          saved ? 'border-ink bg-ink text-white' : 'border-ink bg-surface hover:bg-ink/5', className)}>
        <Heart aria-hidden className={cn('size-4', saved && 'fill-current')} />
        {saved ? 'Guardado' : 'Guardar'}
      </button>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={busy} aria-pressed={saved} aria-label={label} title={label}
      className={cn('inline-flex size-11 items-center justify-center bg-surface transition-colors hover:bg-ink hover:text-white',
        saved ? 'text-danger' : 'text-ink', className)}>
      <Heart aria-hidden className={cn('size-5', saved && 'fill-current')} />
    </button>
  )
}
