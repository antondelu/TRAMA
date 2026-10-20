import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Avatar } from '@/components/ui/Avatar'
import { AccountNavList } from '@/components/navigation/AccountNavList'
import { currentAccountSection } from '@/constants/accountNavigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

// Panel de la cuenta. Las secciones vienen agrupadas de constants/accountNavigation.
// En escritorio se ven todas en la barra lateral; en celular, un botón con la
// sección actual despliega la misma lista (antes era una fila que se salía de la pantalla).
export default function AccountLayout() {
  const { user, can } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const name = `${user.firstName} ${user.lastName}`
  const current = currentAccountSection(pathname, can)
  const CurrentIcon = current.icon

  return (
    <PageContainer className="py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_1fr]">
        <aside className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={name} src={user.avatar} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-sm text-ink-soft">{user.plan ? `Membresía ${user.plan.name}` : 'Membresía Comunidad'}</p>
            </div>
          </div>
          <nav aria-label="Mi cuenta">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="account-sections"
              className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line-strong bg-surface px-4 text-left lg:hidden">
              <CurrentIcon aria-hidden className="size-5 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-soft">Estás en</span>
                <span className="block truncate font-semibold">{current.label}</span>
              </span>
              <span className="text-sm font-semibold text-brand">{open ? 'Cerrar' : 'Ver secciones'}</span>
              <ChevronDown aria-hidden className={cn('size-4 text-brand transition-transform', open && 'rotate-180')} />
            </button>
            <AccountNavList id="account-sections" idPrefix="account-side" onNavigate={() => setOpen(false)}
              className={cn('mt-2 rounded-xl border border-line bg-surface p-2 lg:mt-0 lg:block lg:border-0 lg:bg-transparent lg:p-0', !open && 'max-lg:hidden')} />
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
