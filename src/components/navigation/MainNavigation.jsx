import { NavLink } from 'react-router-dom'
import { CATEGORIES, OPPORTUNITIES_NAV } from '@/constants/navigation'
import { cn } from '@/utils/format'

const linkClass = ({ isActive }) => cn(
  'relative inline-flex min-h-11 items-center px-3 text-sm font-semibold transition-colors',
  'after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:transition-colors',
  isActive ? 'text-brand after:bg-brand' : 'text-ink hover:text-brand after:bg-transparent',
)

// Navegación principal de escritorio: las cuatro áreas y Oportunidades.
export function MainNavigation() {
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center">
        {CATEGORIES.map((c) => <li key={c.id}><NavLink to={c.to} className={linkClass}>{c.label}</NavLink></li>)}
        <li aria-hidden className="mx-2 h-5 w-px bg-line" />
        <li><NavLink to={OPPORTUNITIES_NAV.to} className={linkClass}>{OPPORTUNITIES_NAV.label}</NavLink></li>
      </ul>
    </nav>
  )
}
