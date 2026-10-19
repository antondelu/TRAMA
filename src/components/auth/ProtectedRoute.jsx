import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EmptyState, LoadingSkeleton } from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'

// Exige sesión (y opcionalmente un permiso) para ver la ruta. Sin sesión,
// redirige a ingresar y vuelve después. Sin permiso, explica por qué.
// Esto es solo la capa de interfaz: los servicios vuelven a comprobarlo.
export function ProtectedRoute({ permission, children }) {
  const { user, loading, can } = useAuth()
  const location = useLocation()

  if (loading) return <PageContainer className="py-10"><LoadingSkeleton variant="detail" /></PageContainer>
  if (!user) {
    return <Navigate to={`/ingresar?volver=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  if (permission && !can(permission)) {
    return (
      <PageContainer className="py-16">
        <EmptyState icon={Lock} title="No tenés acceso a esta sección"
          description="Tu cuenta no tiene los permisos necesarios. Si creés que es un error, escribinos desde Contacto."
          action={<><Button variant="secondary" to="/mi-cuenta">Ir a mi cuenta</Button><Button variant="ghost" to="/contacto">Contacto</Button></>} />
      </PageContainer>
    )
  }
  return children ?? <Outlet />
}
