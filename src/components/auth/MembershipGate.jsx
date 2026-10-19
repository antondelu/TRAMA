import { useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const REQUIRED = {
  member: { plan: 'Miembro o Profesional', text: 'Este contenido es exclusivo para miembros de TRAMA.' },
  premium: { plan: 'Profesional', text: 'Este contenido es parte del plan Profesional.' },
}

// Muestra el contenido solo si el servicio lo entregó (locked = false).
// El bloqueo real ocurre en la capa de datos: si no hay acceso, el
// contenido protegido nunca llega al navegador.
export function MembershipGate({ locked, accessLevel, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!locked) return children
  const req = REQUIRED[accessLevel] ?? REQUIRED.member
  return (
    <div className="rounded-[var(--radius-card)] border border-brand/25 bg-brand-soft p-6 text-center sm:p-10">
      <Lock aria-hidden className="mx-auto size-8 text-brand" />
      <h2 className="mt-3 font-display text-2xl font-semibold">Contenido exclusivo</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        {req.text} Accedés con el plan <strong className="text-ink">{req.plan}</strong>.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button to="/planes">Ver planes</Button>
        {!user && <Button variant="secondary" to={`/ingresar?volver=${encodeURIComponent(location.pathname)}`}>Acceder como miembro</Button>}
      </div>
    </div>
  )
}
