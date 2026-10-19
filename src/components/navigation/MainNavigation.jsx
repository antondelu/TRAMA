import { NavLink } from 'react-router-dom'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { cn } from '@/utils/format'

const linkClass = ({ isActive }) => cn(
  'inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors',
  isActive ? 'bg-brand text-white' : 'text-ink hover:bg-brand-soft hover:text-brand',
)

// Navegación principal de escritorio: las cuatro áreas, Oportunidades y Noticias.
export function MainNavigation() {
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 rounded-full bg-surface/70 p-1 shadow-[var(--shadow-card)]">
        {CATEGORIES.map((c) => <li key={c.id}><NavLink to={c.to} className={linkClass}>{c.label}</NavLink></li>)}
        <li><NavLink to={OPPORTUNITIES_NAV.to} className={linkClass}>{OPPORTUNITIES_NAV.label}</NavLink></li>
        <li><NavLink to={NEWS_NAV.to} className={linkClass}>{NEWS_NAV.label}</NavLink></li>
      </ul>
    </nav>
  )
}
