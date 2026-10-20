import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, User, Heart, MessageSquare, Inbox, FileStack, Bell, BadgeCheck, Settings, CalendarDays, Library } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

// Panel de la cuenta con navegación secundaria.
// Calendario y Gestión de recursos solo aparecen si la persona tiene permiso
// (y las rutas también lo comprueban, no alcanza con ocultar el enlace).
export default function AccountLayout() {
  const { user, can } = useAuth()
  const name = `${user.firstName} ${user.lastName}`
  const items = [
    { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/mi-cuenta/perfil', label: 'Perfil', icon: User },
    { to: '/mi-cuenta/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/mi-cuenta/solicitudes', label: 'Solicitudes', icon: Inbox },
    { to: '/mi-cuenta/mensajes', label: 'Mensajes', icon: MessageSquare },
    { to: '/mi-cuenta/publicaciones', label: 'Publicaciones', icon: FileStack },
    ...(can('calendar:manage') ? [{ to: '/mi-cuenta/calendario', label: 'Calendario', icon: CalendarDays }] : []),
    ...(can('resources:manage') ? [{ to: '/mi-cuenta/recursos/gestion', label: 'Gestión de recursos', icon: Library }] : []),
    { to: '/mi-cuenta/notificaciones', label: 'Notificaciones', icon: Bell },
    { to: '/mi-cuenta/membresia', label: 'Membresía', icon: BadgeCheck },
    { to: '/mi-cuenta/configuracion', label: 'Configuración', icon: Settings },
  ]
  return (
    <PageContainer className="py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_1fr]">
        <aside className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={name} src={user.avatar} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-xs text-ink-soft">{user.plan ? `Plan ${user.plan.name}` : 'Plan Comunidad'}</p>
            </div>
          </div>
          <nav aria-label="Mi cuenta">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to} className="shrink-0">
                  <NavLink to={to} end={end} className={({ isActive }) => cn('flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-semibold',
                    isActive ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-ink/5 hover:text-ink')}>
                    <Icon aria-hidden className="size-4" />{label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </PageContainer>
  )
}

export function AccountHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
