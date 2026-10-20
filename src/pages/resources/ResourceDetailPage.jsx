import { useParams } from 'react-router-dom'
import { Download, Clock, User, Calendar, PlayCircle } from 'lucide-react'
import { DetailLayout, DetailState, ActionPanel } from '@/components/layout/DetailLayout'
import { Section } from '@/components/ui/Card'
import { AccessBadge, Badge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Cover } from '@/components/media/Cover'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { MembershipGate } from '@/components/auth/MembershipGate'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { resourcesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'
import { formatDate, formatDuration } from '@/utils/format'

function Player({ r }) {
  if (r.resourceType === 'video' && r.mediaUrl) return <video controls preload="none" src={r.mediaUrl} className="w-full rounded-lg" aria-label={r.title} />
  if (r.resourceType === 'audio' && r.mediaUrl) return <audio controls preload="none" src={r.mediaUrl} className="w-full" aria-label={r.title} />
  if (['video', 'audio', 'course'].includes(r.resourceType)) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong bg-canvas px-4 py-6 text-sm text-ink-soft">
        <PlayCircle aria-hidden className="size-5" />
        Contenido de ejemplo: el {r.resourceType === 'audio' ? 'audio' : 'video'} se publicará cuando esté disponible.
      </p>
    )
  }
  return null
}

export default function ResourceDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  // Se vuelve a pedir al cambiar la sesión: el acceso depende de la membresía.
  const query = useServiceQuery(() => resourcesService.getBySlug(slug), [slug, user?.id, user?.plan?.id])
  const r = query.data
  const related = useServiceQuery(() => resourcesService.related(r), [r?.id], { enabled: Boolean(r) })
  useDocumentTitle(r?.title ?? 'Recurso')
  const { label } = useTaxonomies()

  if (!r) return <DetailState query={query} />

  return (
    <DetailLayout isPreview={r.isPreview}
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Recursos', to: '/recursos' }, { label: r.title }]}
      hero={(
        <div className="grid gap-6 md:grid-cols-[1fr_minmax(0,22rem)] md:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <AccessBadge accessLevel={r.accessLevel} />
              <Badge>{label('resourceTypes', r.resourceType)}</Badge>
              <Badge>{label('resourceCategories', r.category)}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">{r.title}</h1>
            <p className="mt-3 text-lg text-ink-soft">{r.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><User aria-hidden className="size-4" />{r.author}</span>
              {r.publishedAt && <span className="flex items-center gap-1.5"><Calendar aria-hidden className="size-4" />{formatDate(r.publishedAt)}</span>}
              {r.durationMinutes && <span className="flex items-center gap-1.5"><Clock aria-hidden className="size-4" />{formatDuration(r.durationMinutes)}</span>}
              {r.pages && <span>{r.pages} {r.pages === 1 ? 'página' : 'páginas'}</span>}
            </div>
          </div>
          <Cover src={r.coverImage} alt={`Portada de ${r.title}`} kind={r.resourceType} seed={r.title} className="rounded-[var(--radius-card)]" />
        </div>
      )}
      aside={(
        <ActionPanel>
          <FavoriteButton type="resource" id={r.id} title={r.title} variant="button" className="w-full justify-center" />
          {!r.locked && r.fileUrl && <Button icon={Download} href={r.fileUrl} download className="w-full">Descargar archivo</Button>}
          {r.locked && r.hasFile && <p className="text-sm text-ink-soft">Incluye un archivo descargable para miembros.</p>}
          {!user && r.accessLevel === 'public' && <p className="text-sm text-ink-soft">Este recurso es gratuito. Registrate para guardar favoritos y recibir novedades.</p>}
        </ActionPanel>
      )}>
      <Section id="contenido" title="Contenido">
        <MembershipGate locked={r.locked} accessLevel={r.accessLevel}>
          <div className="space-y-4">
            <Player r={r} />
            {/* Texto plano: React lo escapa, no se interpreta HTML. */}
            <div className="max-w-prose space-y-4 leading-relaxed">{r.body?.map((p, i) => <p key={i}>{p}</p>)}</div>
            {r.fileUrl && <p className="text-sm text-ink-soft">Material complementario: archivo de ejemplo de la demo.</p>}
          </div>
        </MembershipGate>
      </Section>
      {related.data?.length > 0 && (
        <Section id="relacionados" title="Recursos relacionados">
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{related.data.map((x) => <li key={x.id} className="flex [&>*]:w-full"><ResourceCard resource={x} /></li>)}</ul>
        </Section>
      )}
    </DetailLayout>
  )
}
