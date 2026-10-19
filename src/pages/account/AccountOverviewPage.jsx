import { Link } from 'react-router-dom'
import { FileStack, Inbox, Send, Heart, MessageSquare, Bell, Plus, Search, CalendarDays } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/StatusBadge'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { profilesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/constants/permissions'
import { formatDate } from '@/utils/format'

function Stat({ to, icon: Icon, label, value }) {
  return (
    <Link to={to} className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-shadow hover:shadow-[var(--shadow-card)]">
      <Icon aria-hidden className="size-5 text-brand" />
      <p className="mt-3 font-serif text-3xl font-semibold">{value}</p>
      <p className="text-sm text-ink-soft group-hover:text-ink">{label}</p>
    </Link>
  )
}

export default function AccountOverviewPage() {
  useDocumentTitle('Mi cuenta')
  const { user, can } = useAuth()
  const { data, error, reload } = useServiceQuery(() => profilesService.dashboard(), [])
  const visibleRoles = user.roles.filter((r) => ROLES[r] && r !== 'user')

  return (
    <>
      <AccountHeader title={`Hola, ${user.firstName}`} description="Este es el resumen de tu actividad en TRAMA."
        actions={<Button icon={Plus} to="/publicar">Publicar</Button>} />
      {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={2} /> : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat to="/mi-cuenta/publicaciones" icon={FileStack} label="Publicaciones activas" value={data.activePublications} />
            <Stat to="/mi-cuenta/solicitudes?bandeja=received" icon={Inbox} label="Solicitudes recibidas pendientes" value={data.receivedPending} />
            <Stat to="/mi-cuenta/solicitudes?bandeja=sent" icon={Send} label="Solicitudes enviadas abiertas" value={data.sentPending} />
            <Stat to="/mi-cuenta/favoritos" icon={Heart} label="Favoritos" value={data.favorites} />
            <Stat to="/mi-cuenta/mensajes" icon={MessageSquare} label="Mensajes sin leer" value={data.unreadMessages} />
            <Stat to="/mi-cuenta/notificaciones" icon={Bell} label="Notificaciones sin leer" value={data.unreadNotifications} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-semibold">Tu perfil</h2>
              <p className="mt-1 text-sm text-ink-soft">{user.city}{user.bio ? ` · ${user.bio}` : ''}</p>
              {visibleRoles.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{visibleRoles.map((r) => <Badge key={r}>{ROLES[r]}</Badge>)}</div>}
              <Button variant="link" to="/mi-cuenta/perfil" className="mt-3">Editar perfil</Button>
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Membresía</h2>
              {user.plan ? (
                <p className="mt-1 text-sm">Plan <strong>{user.plan.name}</strong>, activo hasta el {formatDate(user.membership.endAt.slice(0, 10))}.{user.membership.demo && ' (Activado en modo demo, sin cobro.)'}</p>
              ) : <p className="mt-1 text-sm text-ink-soft">Estás en el plan Comunidad (gratis).</p>}
              <Button variant="link" to="/mi-cuenta/membresia" className="mt-3">{user.plan ? 'Ver membresía' : 'Conocer los planes'}</Button>
            </Card>
          </div>
          <div>
            <h2 className="mb-3 font-semibold">Accesos rápidos</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={Search} to="/oportunidades">Ver convocatorias</Button>
              <Button variant="secondary" icon={Plus} to="/publicar/espectaculo">Publicar un espectáculo</Button>
              {can('calendar:manage') && <Button variant="secondary" icon={CalendarDays} to="/mi-cuenta/calendario">Calendario de mis salas</Button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
