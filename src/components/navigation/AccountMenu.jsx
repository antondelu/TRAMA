import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, User, Heart, MessageSquare, Inbox, Bell, Shield, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

// Menú desplegable de la cuenta (reemplaza Ingresar/Registro con sesión iniciada).
export function AccountMenu() {
  const { user, can, logout } = useAuth()
  const { info } = useToast()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const name = `${user.firstName} ${user.lastName}`

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const items = [
    { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard },
    { to: '/mi-cuenta/perfil', label: 'Perfil', icon: User },
    { to: '/mi-cuenta/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/mi-cuenta/solicitudes', label: 'Solicitudes', icon: Inbox },
    { to: '/mi-cuenta/mensajes', label: 'Mensajes', icon: MessageSquare },
    { to: '/mi-cuenta/notificaciones', label: 'Notificaciones', icon: Bell },
    ...(can('admin:access') ? [{ to: '/admin', label: 'Administración', icon: Shield }] : []),
  ]

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink/5">
        <Avatar name={name} src={user.avatar} size="sm" />
        <span className="hidden text-sm font-semibold xl:inline">{user.firstName}</span>
        <ChevronDown aria-hidden className="size-4 text-ink-soft" />
        <span className="sr-only">Menú de la cuenta de {name}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          <p className="px-3 pb-2 pt-1.5 text-xs text-ink-soft">Sesión de demostración<br /><span className="font-semibold text-ink">{name}</span></p>
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm hover:bg-ink/5">
              <Icon aria-hidden className="size-4 text-ink-soft" />{label}
            </Link>
          ))}
          <button type="button" role="menuitem" className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-danger hover:bg-danger-soft"
            onClick={async () => { setOpen(false); await logout(); info('Cerraste sesión'); navigate('/') }}>
            <LogOut aria-hidden className="size-4" />Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
