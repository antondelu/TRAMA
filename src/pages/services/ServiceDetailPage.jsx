import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Laptop, Receipt, MessageSquare, Download } from 'lucide-react'
import { DetailLayout, DetailState, ActionPanel } from '@/components/layout/DetailLayout'
import { Section, DataList } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { RatingDisplay } from '@/components/ui/RatingDisplay'
import { ImageGallery } from '@/components/media/ImageGallery'
import { SERVICE_AVAILABILITY_TONE } from '@/components/cards/ProfessionalCard'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { ServiceInquiryModal } from '@/features/inquiries/ServiceInquiryModal'
import { servicesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@/context/AuthContext'
import { specialtyIcon } from '@/constants/specialtyIcons'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const query = useServiceQuery(() => servicesService.getBySlug(slug), [slug])
  const pro = query.data
  useDocumentTitle(pro?.name ?? 'Profesional')
  const { label, labels } = useTaxonomies()
  const { user } = useAuth()
  const requireAuth = useRequireAuth()
  const [modal, setModal] = useState(null)

  if (!pro) return <DetailState query={query} />
  const isOwner = user?.id === pro.ownerId

  return (
    <DetailLayout area="area-servicios" isPreview={pro.isPreview}
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Servicios', to: '/servicios' }, { label: pro.name }]}
      hero={(
        <div className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:flex-row sm:items-center">
          <Avatar name={pro.name} src={pro.images?.[0]?.url} focus={pro.images?.[0]?.focus} size="xl" />
          <div className="flex-1">
            <p className="eyebrow text-brand">{labels('specialties', pro.specialties).join(' · ')}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{pro.name}</h1>
            <p className="mt-1 text-ink-soft">{pro.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><MapPin aria-hidden className="size-4" />{pro.location.city}</span>
              <span className="flex items-center gap-1.5"><Laptop aria-hidden className="size-4" />{labels('workModes', pro.workModes).join(' y ')}</span>
              {pro.availability && <Badge tone={SERVICE_AVAILABILITY_TONE[pro.availability]}>{label('serviceAvailability', pro.availability)}</Badge>}
            </div>
          </div>
          <FavoriteButton type="service" id={pro.id} title={pro.name} variant="button" />
        </div>
      )}
      aside={(
        <ActionPanel title="Contratar">
          <PriceDisplay from={pro.priceFrom} unit={pro.priceUnit} currency={pro.currency} emptyLabel="Tarifa a consultar" className="block text-base" />
          <p className="text-sm text-ink-soft">Tarifa orientativa publicada por el profesional.</p>
          {isOwner
            ? <Button variant="secondary" to={`/publicar/servicio?id=${pro.id}`}>Editar perfil</Button>
            : (
              <div className="grid gap-2">
                <Button icon={Receipt} onClick={() => requireAuth(() => setModal('quote'))}>Pedir presupuesto</Button>
                <Button variant="secondary" icon={MessageSquare} onClick={() => requireAuth(() => setModal('inquiry'))}>Hacer una consulta</Button>
                <p className="text-sm text-ink-soft">Las respuestas te llegan a Mi cuenta › Solicitudes.</p>
              </div>
            )}
        </ActionPanel>
      )}>
      <Section id="presentacion" title="Presentación">
        <p className="max-w-prose leading-relaxed">{pro.description}</p>
      </Section>

      <Section id="datos" title="Datos profesionales">
        <DataList items={[
          { label: 'Tipo de proveedor', value: label('providerTypes', pro.providerType) },
          { label: 'Especialidades', value: labels('specialties', pro.specialties) },
          { label: 'Experiencia', value: pro.experienceYears ? `${pro.experienceYears} años (declarada por el profesional)` : null },
          { label: 'Servicios ofrecidos', value: pro.servicesOffered },
          { label: 'Ubicación', value: `${pro.location.city}, ${pro.location.department}` },
          { label: 'Modalidad de trabajo', value: labels('workModes', pro.workModes) },
          { label: 'Disponibilidad', value: pro.availability ? label('serviceAvailability', pro.availability) : 'No informada' },
        ]} />
        <p className="mt-3 text-sm text-ink-soft">TRAMA todavía no verifica experiencias ni certificaciones: los datos los publica cada profesional.</p>
      </Section>

      <Section id="portfolio" title="Portfolio">
        {pro.cv?.url && (
          <Button variant="secondary" icon={Download} href={pro.cv.url} download={pro.cv.name ?? `CV ${pro.name}.pdf`} className="mb-4">Descargar CV (PDF)</Button>
        )}
        <div><ImageGallery images={pro.images} title={pro.name} kind="service" icon={specialtyIcon(pro.specialties)} seed={pro.name} /></div>
      </Section>

      <Section id="resenas" title="Reseñas">
        <RatingDisplay />
      </Section>

      <ServiceInquiryModal open={Boolean(modal)} mode={modal ?? 'inquiry'} pro={pro} onClose={() => setModal(null)} />
    </DetailLayout>
  )
}
