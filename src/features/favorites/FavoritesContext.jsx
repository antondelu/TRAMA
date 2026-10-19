import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { favoritesService, subscribeToData } from '@/services'
import { useAuth } from '@/context/AuthContext'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [keys, setKeys] = useState(() => new Set())

  const load = useCallback(async () => {
    if (!user) return setKeys(new Set())
    setKeys(new Set(await favoritesService.keys()))
  }, [user])

  useEffect(() => {
    load()
    return subscribeToData(load)
  }, [load])

  const value = useMemo(() => ({
    isFavorite: (type, id) => keys.has(`${type}:${id}`),
    toggle: (type, id) => favoritesService.toggle(type, id),
  }), [keys])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  return ctx
}
