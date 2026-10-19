import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Cover } from '@/components/media/Cover'
import { CATEGORIES } from '@/constants/navigation'

const KINDS = { salas: 'venue', espectaculos: 'show', servicios: 'service', recursos: 'resource' }

export function CategoryCards() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORIES.map((c, i) => (
        <li key={c.id}>
          <Link to={c.to} className="group block h-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
            <Cover kind={KINDS[c.id]} tone={c.tone} alt="" label={`0${i + 1}`} ratio="aspect-[5/3]" />
            <div className="p-5">
              <h3 className="flex items-center justify-between font-serif text-2xl font-semibold">
                {c.label}
                <ArrowUpRight aria-hidden className="size-5 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{c.description}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
