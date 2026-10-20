import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Shield, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { AccountNavList } from './AccountNavList'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

// Menú desplegable de la cuenta (reemplaza Ingresar/Registro con sesión iniciada).
// Muestra las mismas secciones que la barra lateral de Mi cuenta.
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

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="account-menu"
        className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink/5">
        <Avatar name={name} src={user.avatar} size="sm" />
        <span className="hidden text-sm font-semibold xl:inline">{user.firstName}</span>
        <ChevronDown aria-hidden className="size-4 text-ink-soft" />
        <span className="sr-only">Menú de la cuenta de {name}</span>
      </button>
      {open && (
        <nav id="account-menu" aria-label="Mi cuenta" className="absolute right-0 top-full z-40 mt-2 max-h-[calc(100vh-6rem)] w-64 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-[var(--shadow-pop)]">
          <p className="px-3 pb-2 pt-1 text-sm text-ink-soft">Sesión de demostración<br /><span className="font-semibold text-ink">{name}</span></p>
          <AccountNavList idPrefix="account-menu" onNavigate={() => setOpen(false)} />
          <hr className="my-2 border-line" />
          {can('admin:access') && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[0.95rem] font-semibold hover:bg-ink/5">
              <Shield aria-hidden className="size-4 text-ink-soft" />Administración
            </Link>
          )}
          <button type="button" className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-[0.95rem] font-semibold text-danger hover:bg-danger-soft"
            onClick={async () => { setOpen(false); await logout(); info('Cerraste sesión'); navigate('/') }}>
            <LogOut aria-hidden className="size-4" />Cerrar sesión
          </button>
        </nav>
      )}
    </div>
  )
}
