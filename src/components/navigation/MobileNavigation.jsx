import { NavLink } from 'react-router-dom'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { AccountNavList } from './AccountNavList'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

export function MobileNavigation({ open, onClose }) {
  const { user, can, logout } = useAuth()
  const items = [...CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV]
  const linkClass = ({ isActive }) => cn('flex min-h-12 items-center gap-3 border-l-4 px-3 text-base font-bold', isActive ? 'border-[var(--area,var(--color-ink))] bg-ink/5' : 'border-transparent hover:bg-ink/5')

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
              <li key={item.id} className={item.area}>
                <NavLink to={item.to} className={linkClass} onClick={onClose}>
                  <span aria-hidden className="inline-flex size-8 items-center justify-center bg-[var(--area)] text-[var(--area-on)]"><Icon className="size-4" /></span>{item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
        <hr className="my-4 border-line" />
        <ul className="space-y-1">
          <li><NavLink to="/publicar" className={linkClass} onClick={onClose}>Publicar en TRAMA</NavLink></li>
          <li><NavLink to="/planes" className={linkClass} onClick={onClose}>Membresías</NavLink></li>
          {can('admin:access') && <li><NavLink to="/admin" className={linkClass} onClick={onClose}>Administración</NavLink></li>}
        </ul>
        {user && (
          <>
            <hr className="my-4 border-line" />
            <p className="mb-2 px-3 font-display text-lg font-semibold">Mi cuenta</p>
            <AccountNavList idPrefix="account-drawer" onNavigate={onClose} />
          </>
        )}
      </nav>
    </Drawer>
  )
}
