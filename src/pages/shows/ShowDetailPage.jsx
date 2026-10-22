import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, Users, Download, Send, MessageSquare, Video } from 'lucide-react'
import { DetailLayout, DetailState, ActionPanel } from '@/components/layout/DetailLayout'
import { ImageGallery } from '@/components/media/ImageGallery'
import { Section, DataList } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { SHOW_AVAILABILITY } from '@/components/cards/ShowCard'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { ShowInquiryModal } from '@/features/inquiries/ShowInquiryModal'
import { showsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@/context/AuthContext'
import { formatDuration } from '@/utils/format'
import { safeHttpUrl } from '@/utils/url'

const minutes = (m) => (m ? formatDuration(m) : null)

export default function ShowDetailPage() {
  const { slug } = useParams()
  const query = useServiceQuery(() => showsService.getBySlug(slug), [slug])
  const show = query.data
  useDocumentTitle(show?.title ?? 'Espectáculo')
  const { label, labels } = useTaxonomies()
  const { user } = useAuth()
  const requireAuth = useRequireAuth()
  const [modal, setModal] = useState(null)

  if (!show) return <DetailState query={query} />
  const c = show.credits
  const r = show.technicalRider
  const isOwner = user?.id === show.ownerId
  const availability = SHOW_AVAILABILITY[show.availability]
  const downloads = [
    show.media.dossierUrl && { href: show.media.dossierUrl, label: 'Dossier (PDF)' },
    show.media.technicalSheetUrl && { href: show.media.technicalSheetUrl, label: 'Ficha técnica (PDF)' },
  ].filter(Boolean)

  return (
    <DetailLayout area="area-shows" isPreview={show.isPreview}
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Espectáculos', to: '/espectaculos' }, { label: show.title }]}
      hero={(
        <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-end">
          <ImageGallery images={show.media.poster ? [{ url: show.media.poster, alt: `Afiche de ${show.title}` }] : show.media.photos} title={show.title} kind="show" seed={show.title} />
          <div>
            <p className="eyebrow text-brand">{label('disciplines', show.discipline)} · {label('genres', show.genre)}</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{show.title}</h1>
            <p className="mt-2 text-lg text-ink-soft">{show.company}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {availability && <Badge tone={availability.tone}>{availability.label}</Badge>}
              <span className="flex items-center gap-1.5 text-ink-soft"><Clock aria-hidden className="size-4" />{formatDuration(show.durationMinutes)}</span>
              <span className="flex items-center gap-1.5 text-ink-soft"><Users aria-hidden className="size-4" />{show.castSize} {show.castSize === 1 ? 'intérprete' : 'intérpretes'}</span>
              <FavoriteButton type="show" id={show.id} title={show.title} variant="button" />
            </div>
          </div>
        </div>
      )}
      aside={(
        <ActionPanel title="Contratación">
          <PriceDisplay from={show.priceFrom} to={show.priceTo} currency={show.currency} emptyLabel="Caché a consultar" className="block text-base" />
          <DataList items={[
            { label: 'Modalidades', value: labels('bookingModes', show.bookingModes) },
            { label: 'Giras', value: show.touring ? 'Sí, disponible para giras' : 'No hace giras por ahora' },
            { label: 'Coproducción', value: show.coproduction ? 'Abierta a coproducir' : 'No' },
            { label: 'Por función o temporada', value: [show.bookingModes.includes('por-funcion') && 'Por función', show.bookingModes.includes('temporada') && 'Temporada'].filter(Boolean).join(' y ') || null },
            { label: 'Condiciones', value: show.feeNotes },
          ]} />
          {!isOwner && (
            <div className="grid gap-2">
              <Button icon={Send} onClick={() => requireAuth(() => setModal('proposal'))}>Pedir contratación</Button>
              <Button variant="secondary" icon={MessageSquare} onClick={() => requireAuth(() => setModal('inquiry'))}>Hacer una consulta</Button>
              <p className="text-sm text-ink-soft">Las respuestas te llegan a Mi cuenta › Solicitudes.</p>
            </div>
          )}
          {isOwner && <Button variant="secondary" to={`/publicar/espectaculo?id=${show.id}`}>Editar espectáculo</Button>}
        </ActionPanel>
      )}>
      <Section id="sinopsis" title="Sinopsis">
        <p className="max-w-prose text-lg leading-relaxed">{show.synopsis}</p>
        <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">{show.description}</p>
      </Section>

      <Section id="ficha-artistica" title="Ficha artística">
        <DataList items={[
          { label: 'Dirección', value: c.direction }, { label: 'Dramaturgia', value: c.dramaturgy }, { label: 'Elenco', value: c.cast },
          { label: 'Producción', value: c.production }, { label: 'Diseño de iluminación', value: c.lighting }, { label: 'Diseño sonoro', value: c.sound },
          { label: 'Escenografía', value: c.set }, { label: 'Vestuario', value: c.costume }, { label: 'Otros créditos', value: c.others },
        ]} />
      </Section>

      <Section id="ficha-tecnica" title="Ficha técnica">
        <DataList items={[
          { label: 'Duración', value: formatDuration(show.durationMinutes) },
          { label: 'Intérpretes', value: String(show.castSize) },
          { label: 'Público', value: label('audiences', show.audience) },
          { label: 'Formato de montaje', value: label('stagingFormats', show.stagingFormat) },
          { label: 'Tiempo de montaje', value: minutes(r.setupMinutes) },
          { label: 'Tiempo de desmontaje', value: minutes(r.strikeMinutes) },
          { label: 'Espacio mínimo', value: r.minStage && [r.minStage.width && `${r.minStage.width} m de ancho`, r.minStage.depth && `${r.minStage.depth} m de fondo`, r.minStage.height && `${r.minStage.height} m de altura`].filter(Boolean).join(' × ') },
          { label: 'Iluminación', value: r.lighting }, { label: 'Sonido', value: r.sound },
          { label: 'Equipamiento necesario', value: r.equipment }, { label: 'Transporte', value: r.transport },
          { label: 'Condiciones de gira', value: r.touringConditions },
        ]} />
      </Section>

      <Section id="materiales" title="Materiales">
        <div className="space-y-3">
          {safeHttpUrl(show.media.videoUrl, { httpsOnly: true })
            ? <video controls preload="none" src={safeHttpUrl(show.media.videoUrl, { httpsOnly: true })} className="w-full rounded-lg" aria-label={`Video promocional de ${show.title}`} />
            : <p className="flex items-center gap-2 text-sm text-ink-soft"><Video aria-hidden className="size-4" />La compañía todavía no cargó un video promocional.</p>}
          {downloads.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {downloads.map((d) => <Button key={d.href} variant="secondary" icon={Download} href={d.href} download>{d.label}</Button>)}
            </div>
          ) : <p className="text-sm text-ink-soft">No hay archivos descargables para este espectáculo.</p>}
          {downloads.length > 0 && <p className="text-sm text-ink-soft">Archivos de ejemplo de la demo.</p>}
        </div>
      </Section>

      <ShowInquiryModal open={Boolean(modal)} mode={modal ?? 'inquiry'} show={show} onClose={() => setModal(null)} />
    </DetailLayout>
  )
}
