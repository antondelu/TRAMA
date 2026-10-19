import { Link } from 'react-router-dom'
import { resourcesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { AccessBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/States'

// Destacados y colecciones editoriales de la biblioteca.
export function ResourceCollections() {
  const { data } = useServiceQuery(() => resourcesService.collections(), [])
  if (!data) return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-52" />)}</div>
  return (
    <section aria-labelledby="collections-title">
      <h2 id="collections-title" className="font-serif text-2xl font-semibold">Colecciones editoriales</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {data.map((c) => (
          <li key={c.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <h3 className="font-serif text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{c.description}</p>
            <ol className="mt-4 space-y-2.5">
              {c.items.map((r, i) => (
                <li key={r.id} className="flex items-start gap-3 text-sm">
                  <span className="font-serif text-lg leading-none text-brand">{i + 1}</span>
                  <div className="min-w-0">
                    <Link to={`/recursos/${r.slug}`} className="font-semibold hover:text-brand hover:underline">{r.title}</Link>
                    <div className="mt-1"><AccessBadge accessLevel={r.accessLevel} /></div>
                  </div>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  )
}
