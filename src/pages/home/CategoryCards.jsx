import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { cn } from '@/utils/format'

// Las áreas como bloques de su color, de distinto tamaño: Salas y
// Espectáculos, las más usadas, ocupan el doble. Cada color se repite en el
// menú, las etiquetas y los catálogos, así se reconoce el área sin leer.
const AREAS = [CATEGORIES[0], CATEGORIES[1], CATEGORIES[2], OPPORTUNITIES_NAV, CATEGORIES[3], NEWS_NAV]

export function CategoryCards() {
  return (
    <nav aria-label="Áreas de TRAMA">
      <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        {AREAS.map(({ id, label, to, icon: Icon, description, area }, i) => {
          const big = i < 2
          return (
            <Reveal as="li" key={id} delay={i * 70} className={cn(big ? 'col-span-2' : 'col-span-1', area)}>
              <Link to={to}
                className={cn('group flex h-full flex-col justify-between gap-8 bg-[var(--area)] p-5 text-[var(--area-on)] transition-[filter] hover:brightness-110 sm:p-6',
                  big ? 'min-h-56 sm:min-h-72' : 'min-h-44 sm:min-h-52')}>
                <span className="flex items-start justify-between gap-3">
                  <Icon aria-hidden className="size-7" strokeWidth={1.75} />
                  <ArrowRight aria-hidden className="size-7 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="min-w-0">
                  {/* En celular los nombres de los bloques chicos se condensan para entrar en media pantalla. */}
                  <span className={cn('block font-display font-extrabold leading-none [overflow-wrap:anywhere]',
                    big ? 'text-[2.15rem] sm:text-6xl' : 'text-[1.4rem] max-sm:[font-stretch:80%] sm:text-3xl')}>
                    {label}
                  </span>
                  <span className={cn('mt-3 block max-w-md', big ? 'text-base sm:text-lg' : 'text-sm sm:text-base')}>{description}</span>
                </span>
              </Link>
            </Reveal>
          )
        })}
      </ul>
    </nav>
  )
}
