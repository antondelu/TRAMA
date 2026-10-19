import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CalendarClock, ExternalLink, Send, ShieldAlert, Building } from 'lucide-react'
import { DetailLayout, DetailState, ActionPanel } from '@/components/layout/DetailLayout'
import { Section, DataList } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { ApplicationModal } from '@/features/applications/ApplicationModal'
import { opportunitiesService, requestsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/utils/format'
import { daysUntil } from '@/utils/dates'

// El botón depende del estado y del tipo de convocatoria:
// externa -> enlace a la URL configurada; interna -> formulario de postulación.
function ApplyActions({ o, myApplication, isOwner, onApply }) {
  if (isOwner) return <Button variant="secondary" to={`/publicar/convocatoria?id=${o.id}`}>Editar convocatoria</Button>
  if (!o.acceptsApplications) {
    const reason = o.publicState === 'expired' ? 'La fecha límite ya pasó.' : o.publicState === 'closed' ? 'La organización cerró la convocatoria.' : 'Todavía no abrió.'
    return <p className="rounded-lg bg-ink/5 px-3 py-2 text-sm">No recibe postulaciones. {reason}</p>
  }
  if (myApplication) {
    return (
      <div className="space-y-2 rounded-lg bg-accent-soft px-3 py-3 text-sm">
        <p className="font-semibold text-accent">Ya te postulaste.</p>
        <p>Estado: <StatusBadge status={myApplication.status} label={myApplication.stateLabel} /></p>
        <Link to="/mi-cuenta/solicitudes" className="font-semibold text-brand hover:underline">Ver en Solicitudes</Link>
      </div>
    )
  }
  if (o.applicationMode === 'external') {
    return (
      <div className="space-y-2">
        <Button href={o.externalUrl} target="_blank" rel="noopener noreferrer" iconRight={ExternalLink} className="w-full">Postularme en el sitio de la organización</Button>
        <p className="break-all text-xs text-ink-soft">Te lleva a: {o.externalUrl}{o.externalUrl.includes('example.org') ? ' (URL de ejemplo de la demo)' : ''}</p>
      </div>
    )
  }
  const proposal = ['coproduccion', 'colaboracion', 'proyectos'].includes(o.opportunityType)
  return <Button icon={Send} className="w-full" onClick={onApply}>{proposal ? 'Enviar propuesta' : 'Postularme'}</Button>
}

export default function OpportunityDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const query = useServiceQuery(() => opportunitiesService.getBySlug(slug), [slug])
  const o = query.data
  const mine = useServiceQuery(() => requestsService.myApplicationFor(o.id), [o?.id, user?.id], { enabled: Boolean(o && user) })
  useDocumentTitle(o?.title ?? 'Oportunidad')
  const { label, labels } = useTaxonomies()
  const requireAuth = useRequireAuth()
  const [applyOpen, setApplyOpen] = useState(false)

  if (!o) return <DetailState query={query} />
  const left = daysUntil(o.deadline)
  const isOwner = user?.id === o.ownerId

  return (
    <DetailLayout isPreview={o.isPreview}
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Oportunidades', to: '/oportunidades' }, { label: o.title }]}
      hero={(
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={o.publicState} label={o.publicState === 'published' ? 'Abierta' : undefined} />
              <span className="eyebrow self-center">{label('opportunityTypes', o.opportunityType)}</span>
            </div>
            <FavoriteButton type="opportunity" id={o.id} title={o.title} variant="button" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-5xl">{o.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-lg text-ink-soft"><Building aria-hidden className="size-5" />{o.organizationName}</p>
          {!o.originVerified && (
            <p className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
              <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              Publicada por un usuario de TRAMA. El origen de esta convocatoria no fue verificado.
            </p>
          )}
        </div>
      )}
      aside={(
        <ActionPanel>
          <p className="flex items-center gap-2 font-semibold"><CalendarClock aria-hidden className="size-5 text-brand" />Fecha límite: {formatDate(o.deadline)}</p>
          {o.publicState === 'published' && left >= 0 && <p className="text-sm text-ink-soft">{left === 0 ? 'Cierra hoy.' : `Faltan ${left} ${left === 1 ? 'día' : 'días'}.`}</p>}
          <ApplyActions o={o} myApplication={mine.data} isOwner={isOwner} onApply={() => requireAuth(() => setApplyOpen(true))} />
        </ActionPanel>
      )}>
      <Section id="descripcion" title="Descripción"><p className="max-w-prose leading-relaxed">{o.description}</p></Section>
      <Section id="detalles" title="Detalles">
        <DataList items={[
          { label: 'Tipo', value: label('opportunityTypes', o.opportunityType) },
          { label: 'Convoca', value: `${o.organizationName} (${label('organizationTypes', o.organizationType)})` },
          { label: 'Disciplinas', value: labels('disciplines', o.disciplines) },
          { label: 'Lugar o alcance', value: o.location.scope },
          { label: 'Condiciones económicas', value: `${label('compensation', o.compensation.type)}${o.compensation.details ? `. ${o.compensation.details}` : ''}` },
          { label: 'Apertura', value: formatDate(o.applicationStart) },
          { label: 'Fecha límite', value: formatDate(o.deadline) },
          { label: 'Estado', value: <StatusBadge status={o.publicState} label={o.publicState === 'published' ? 'Abierta' : undefined} /> },
        ]} />
      </Section>
      <Section id="requisitos" title="Requisitos">
        {o.requirements.length ? <ul className="list-disc space-y-1 pl-5">{o.requirements.map((r) => <li key={r}>{r}</li>)}</ul> : <p className="text-sm text-ink-soft">No se indicaron requisitos.</p>}
      </Section>
      <Section id="documentacion" title="Documentación requerida">
        {o.documents.length ? <ul className="list-disc space-y-1 pl-5">{o.documents.map((d) => <li key={d}>{d}</li>)}</ul> : <p className="text-sm text-ink-soft">No se indicó documentación.</p>}
      </Section>
      <Section id="procedimiento" title="Cómo postularse">
        <p className="max-w-prose">{o.procedure || 'La organización no detalló el procedimiento.'}</p>
      </Section>
      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} opportunity={o} />
    </DetailLayout>
  )
}
