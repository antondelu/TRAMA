import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { FavoritesProvider } from '@/features/favorites/FavoritesContext'

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
