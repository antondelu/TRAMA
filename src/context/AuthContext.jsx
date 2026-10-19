import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService, subscribeToData } from '@/services'
import { hasPermission } from '@/constants/permissions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setUser(await authService.getSession())
    setLoading(false)
  }, [])

  // Los roles dependen de datos (membresía, publicaciones), así que se
  // recalculan cuando cambian.
  useEffect(() => {
    refresh()
    return subscribeToData(refresh)
  }, [refresh])

  const value = useMemo(() => ({
    user,
    loading,
    isDemo: authService.isDemo,
    roles: user?.roles ?? ['visitor'],
    can: (permission) => hasPermission(user?.roles ?? ['visitor'], permission),
    async login(email, password) {
      const u = await authService.login(email, password)
      setUser(u)
      return u
    },
    async loginAsDemo(id) {
      const u = await authService.loginAsDemo(id)
      setUser(u)
      return u
    },
    async register(data) {
      const u = await authService.register(data)
      setUser(u)
      return u
    },
    async logout() {
      await authService.logout()
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
