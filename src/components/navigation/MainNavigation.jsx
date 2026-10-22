import { NavLink, useLocation } from 'react-router-dom'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { cn } from '@/utils/format'

const SECTIONS = [...CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV]

// Navegación principal de escritorio: cada sección es una pestaña que cuelga
// del borde superior. En reposo es clara, con una franja fina del color de su
// área arriba; al pasar el mouse se llena de ese color. La sección actual queda
// llena, baja hasta el filete del encabezado y se une a la página, como una
// pestaña de carpeta. Así el color fuerte aparece una sola vez por pantalla.
export function MainNavigation() {
  return (
    <nav aria-label="Principal" className="hidden self-stretch lg:flex">
      <ul className="flex items-stretch gap-px">
        {SECTIONS.map((c) => (
          <li key={c.id} className={cn('flex', c.area)}>
            <NavLink to={c.to} className={({ isActive }) => cn(
              'flex items-end border-t-4 border-[var(--area)] px-2.5 pb-2.5 text-[0.9rem] font-bold transition-[margin,padding,background-color,color] xl:px-3.5 xl:text-[0.95rem]',
              isActive
                ? 'relative z-10 -mb-0.5 bg-[var(--area)] pb-3.5 text-[var(--area-on)]'
                : 'mb-1.5 text-ink hover:mb-0.5 hover:bg-[var(--area)] hover:text-[var(--area-on)]',
            )}>
              {c.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// En celular, una franja con los seis colores debajo del encabezado; el de la
// sección actual es más alto. Es decorativa: la navegación está en el menú ☰.
export function AreaStrip() {
  const { pathname } = useLocation()
  return (
    <div aria-hidden className="flex h-3 items-start lg:hidden">
      {SECTIONS.map((c) => {
        const active = pathname === c.to || pathname.startsWith(`${c.to}/`)
        return <span key={c.id} className={cn('flex-1 bg-[var(--area)]', c.area, active ? 'h-3' : 'h-1.5')} />
      })}
    </div>
  )
}
