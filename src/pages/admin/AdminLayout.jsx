import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldCheck, Megaphone, Library, BadgeDollarSign, BarChart3, Settings, ArrowLeft, Menu, ShieldAlert } from 'lucide-react'
import { Logo } from '@/components/navigation/Logo'
import { Drawer } from '@/components/ui/Drawer'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

const ITEMS = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true, permission: 'admin:access' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, permission: 'admin:users' },
  { to: '/admin/publicaciones', label: 'Moderación', icon: ShieldCheck, permission: 'admin:moderate' },
  { to: '/admin/oportunidades', label: 'Oportunidades', icon: Megaphone, permission: 'admin:moderate' },
  { to: '/admin/recursos', label: 'Recursos', icon: Library, permission: 'resources:manage' },
  { to: '/admin/membresias', label: 'Membresías', icon: BadgeDollarSign, permission: 'admin:plans' },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3, permission: 'admin:reports' },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, permission: 'admin:config' },
]

function AdminNav({ onNavigate }) {
  const { can } = useAuth()
  return (
    <nav aria-label="Administración">
      <ul className="space-y-1">
        {ITEMS.filter((i) => can(i.permission)).map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => cn('flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold',
              isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')}>
              <Icon aria-hidden className="size-4" />{label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Marco del panel: separado del sitio público (barra lateral oscura).
export default function AdminLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden flex-col gap-6 bg-accent-strong p-4 text-white lg:flex">
        <div><Logo inverted /><p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/60">Administración</p></div>
        <AdminNav />
        <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft aria-hidden className="size-4" />Volver al sitio</Link>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú de administración"><Menu aria-hidden className="size-5" /></button>
          <p className="flex items-center gap-2 text-xs text-warning">
            <ShieldAlert aria-hidden className="size-4 shrink-0" />
            Demo: los permisos se comprueban solo en el navegador. En producción, el servidor tiene que validarlos y auditar cada acción.
          </p>
          <p className="hidden shrink-0 text-sm font-semibold sm:block">{user.firstName} {user.lastName}</p>
        </header>
        <main id="contenido" className="px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Administración">
        <div className="-mx-5 -my-4 h-full bg-accent-strong p-4"><AdminNav onNavigate={() => setOpen(false)} /><Link to="/" className="mt-6 flex items-center gap-2 text-sm text-white/70"><ArrowLeft aria-hidden className="size-4" />Volver al sitio</Link></div>
      </Drawer>
      <ScrollRestoration />
    </div>
  )
}

export function AdminHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
