import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import { CATEGORIES } from '@/constants/navigation'

// Las cuatro áreas como íconos grandes, sin tarjetas ni imágenes.
// Al pasar el mouse el ícono se llena de color y gira un poco.
export function CategoryCards() {
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORIES.map(({ id, label, to, icon: Icon, description }, i) => (
        <Reveal as="li" key={id} delay={i * 110}>
          <Link to={to} className="group flex flex-col items-start">
            <span className="relative flex size-20 items-center justify-center">
              <span aria-hidden className="absolute inset-0 rounded-[1.75rem] bg-brand-soft transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-brand" />
              <Icon aria-hidden className="relative size-9 text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-white" strokeWidth={1.5} />
            </span>
            <span className="mt-6 flex items-center gap-2 font-display text-2xl font-bold">
              {label}
              <ArrowRight aria-hidden className="size-5 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
            <span className="mt-1.5 max-w-[16rem] text-sm text-ink-soft">{description}</span>
          </Link>
        </Reveal>
      ))}
    </ul>
  )
}
