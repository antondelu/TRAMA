import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

// Para acciones que necesitan sesión (reservar, consultar, postularse):
// si no hay sesión, lleva a ingresar y después vuelve a esta página.
export function useRequireAuth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { info } = useToast()
  return (action) => {
    if (user) return action()
    info('Iniciá sesión para continuar', 'Después volvés a esta página.')
    navigate(`/ingresar?volver=${encodeURIComponent(location.pathname + location.search)}`)
    return undefined
  }
}
