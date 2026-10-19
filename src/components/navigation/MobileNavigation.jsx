import { NavLink } from 'react-router-dom'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

export function MobileNavigation({ open, onClose }) {
  const { user, can, logout } = useAuth()
  const items = [...CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV]
  const linkClass = ({ isActive }) => cn('flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold', isActive ? 'bg-brand-soft text-brand' : 'hover:bg-ink/5')

  return (
    <Drawer open={open} onClose={onClose} title="Menú"
      footer={user ? (
        <Button variant="secondary" className="w-full" onClick={async () => { await logout(); onClose() }}>Cerrar sesión</Button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" to="/ingresar" onClick={onClose}>Ingresar</Button>
          <Button to="/registro" onClick={onClose}>Registrarme</Button>
        </div>
      )}>
      <nav aria-label="Principal (móvil)">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <NavLink to={item.to} className={linkClass} onClick={onClose}>
                  <Icon aria-hidden className="size-5 text-ink-soft" />{item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
        <hr className="my-4 border-line" />
        <ul className="space-y-1">
          <li><NavLink to="/publicar" className={linkClass} onClick={onClose}>Publicar en TRAMA</NavLink></li>
          <li><NavLink to="/planes" className={linkClass} onClick={onClose}>Planes</NavLink></li>
          {user && <li><NavLink to="/mi-cuenta" end className={linkClass} onClick={onClose}>Mi cuenta</NavLink></li>}
          {can('admin:access') && <li><NavLink to="/admin" className={linkClass} onClick={onClose}>Administración</NavLink></li>}
        </ul>
      </nav>
    </Drawer>
  )
}
