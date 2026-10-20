import { NavLink } from 'react-router-dom'
import { ACCOUNT_HOME, accountGroups } from '@/constants/accountNavigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

const linkClass = ({ isActive }) => cn('flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[0.95rem] font-semibold',
  isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-ink/5')

function Item({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <li>
      <NavLink to={to} end={end} className={linkClass} onClick={onNavigate}>
        <Icon aria-hidden className="size-4 shrink-0 text-ink-soft" />{label}
      </NavLink>
    </li>
  )
}

// Lista agrupada de las secciones de Mi cuenta. `onNavigate` cierra el menú
// que la contiene (desplegable, menú de celular).
export function AccountNavList({ id, onNavigate, idPrefix = 'account', className }) {
  const { can } = useAuth()
  return (
    <div id={id} className={cn('space-y-4', className)}>
      <ul><Item {...ACCOUNT_HOME} onNavigate={onNavigate} /></ul>
      {accountGroups(can).map((g) => (
        <div key={g.id}>
          <p id={`${idPrefix}-${g.id}`} className="mb-1 px-3 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">{g.title}</p>
          <ul aria-labelledby={`${idPrefix}-${g.id}`} className="space-y-0.5">
            {g.items.map((item) => <Item key={item.to} {...item} onNavigate={onNavigate} />)}
          </ul>
        </div>
      ))}
    </div>
  )
}
