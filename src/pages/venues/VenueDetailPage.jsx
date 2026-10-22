import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Users, MessageSquare, CalendarPlus, Megaphone } from 'lucide-react'
import { DetailLayout, DetailState, ActionPanel } from '@/components/layout/DetailLayout'
import { ImageGallery } from '@/components/media/ImageGallery'
import { Section, DataList } from '@/components/ui/Card'
import { Badge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { VenueAvailability } from '@/features/bookings/VenueAvailability'
import { BookingRequestModal } from '@/features/bookings/BookingRequestModal'
import { VenueInquiryModal } from '@/features/inquiries/VenueInquiryModal'
import { venuesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuth } from '@/context/AuthContext'

export default function VenueDetailPage() {
  const { slug } = useParams()
  const query = useServiceQuery(() => venuesService.getBySlug(slug), [slug])
  const venue = query.data
  useDocumentTitle(venue?.name ?? 'Sala')
  const { label, labels } = useTaxonomies()
  const { user } = useAuth()
  const requireAuth = useRequireAuth()
  const [booking, setBooking] = useState({ open: false, date: null })
  const [contactOpen, setContactOpen] = useState(false)

  if (!venue) return <DetailState query={query} />
  const isOwner = user?.id === venue.ownerId
  const t = venue.technicalSpecs
  const dims = t.dimensions
  const openBooking = (date = null) => requireAuth(() => setBooking({ open: true, date }))

  return (
    <DetailLayout area="area-salas" isPreview={venue.isPreview}
      breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Salas', to: '/salas' }, { label: venue.name }]}
      hero={(
        <>
          <ImageGallery images={venue.images} title={venue.name} kind="venue" seed={venue.name} />
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-brand">{label('venueTypes', venue.venueType)}</p>
              <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{venue.name}</h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-ink-soft">
                <span className="flex items-center gap-1.5"><MapPin aria-hidden className="size-4" />{venue.city}, {venue.department}{venue.address?.area ? ` · ${venue.address.area}` : ''}</span>
                <span className="flex items-center gap-1.5"><Users aria-hidden className="size-4" />Hasta {venue.capacity} personas</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {venue.hasOpenCall && <Badge tone="convocatoria" icon={Megaphone}>Convocatoria abierta</Badge>}
              <FavoriteButton type="venue" id={venue.id} title={venue.name} variant="button" />
            </div>
          </div>
        </>
      )}
      aside={(
        <ActionPanel title="Reservar o consultar">
          <PriceDisplay from={venue.priceFrom} to={venue.priceTo} unit={venue.priceUnit} currency={venue.currency} className="block text-base" />
          <p className="text-sm text-ink-soft">Precio orientativo informado por la sala. Las condiciones finales se acuerdan con la sala.</p>
          {isOwner ? (
            <Button to="/mi-cuenta/calendario" className="w-full" variant="secondary">Gestionar mi calendario</Button>
          ) : (
            <div className="grid gap-2">
              <Button icon={CalendarPlus} onClick={() => openBooking()}>Solicitar reserva</Button>
              <Button variant="secondary" icon={MessageSquare} onClick={() => requireAuth(() => setContactOpen(true))}>Hacer una consulta</Button>
              <a href="#calendario" className="text-center text-sm font-semibold text-brand hover:underline">Ver las fechas libres en el calendario</a>
              <p className="text-sm text-ink-soft">Las respuestas te llegan a Mi cuenta › Solicitudes.</p>
            </div>
          )}
          <p className="border-t border-line pt-3 text-sm text-ink-soft">El contacto se hace dentro de TRAMA: tus datos y los de la sala no se comparten hasta que ustedes lo decidan.</p>
        </ActionPanel>
      )}>
      <Section id="descripcion" title="Sobre el espacio">
        <p className="max-w-prose leading-relaxed">{venue.description}</p>
      </Section>

      <Section id="ficha" title="Características técnicas">
        <DataList items={[
          { label: 'Dimensiones', value: dims && [dims.width && `${dims.width} m de ancho`, dims.depth && `${dims.depth} m de fondo`, dims.height && `${dims.height} m de altura`].filter(Boolean).join(' × ') },
          { label: 'Escenario', value: t.stageType },
          { label: 'Iluminación', value: t.lighting },
          { label: 'Sonido', value: t.sound },
          { label: 'Camerinos', value: t.dressingRooms != null ? String(t.dressingRooms) : null },
          { label: 'Equipamiento', value: labels('equipment', venue.equipment) },
          { label: 'Accesibilidad', value: venue.accessibility.length ? labels('accessibility', venue.accessibility) : 'La sala no informó opciones de accesibilidad' },
          { label: 'Otras instalaciones', value: t.otherFacilities },
        ]} />
      </Section>

      <Section id="condiciones" title="Condiciones">
        <DataList items={[
          { label: 'Modalidad de alquiler', value: labels('rentalModes', venue.rentalModes) },
          { label: 'Precio orientativo', value: <PriceDisplay from={venue.priceFrom} to={venue.priceTo} unit={venue.priceUnit} currency={venue.currency} /> },
          { label: 'Duración mínima', value: venue.minDuration },
          { label: 'Condiciones de uso', value: venue.conditions },
          { label: 'Servicios incluidos', value: venue.includedServices },
          { label: 'Gastos adicionales', value: venue.extraCosts },
        ]} />
      </Section>

      <Section id="calendario" title="Calendario" description="Elegí una fecha o un rango para consultar. Las fechas sin información no se consideran libres.">
        <VenueAvailability venueId={venue.id} onRequest={isOwner ? undefined : openBooking} />
      </Section>

      <Section id="convocatorias" title="Convocatorias de la sala" description="Si buscás que la sala programe tu obra, postulate a una convocatoria. Es distinto de alquilar el espacio.">
        {venue.openCalls.length
          ? <ul className="grid gap-4 sm:grid-cols-2">{venue.openCalls.map((o) => <li key={o.id} className="flex [&>*]:w-full"><OpportunityCard opportunity={{ ...o, publicState: 'published' }} /></li>)}</ul>
          : <p className="text-sm text-ink-soft">Esta sala no tiene convocatorias abiertas en este momento.</p>}
      </Section>

      <BookingRequestModal open={booking.open} initialDate={booking.date} venue={venue} onClose={() => setBooking({ open: false, date: null })} />
      <VenueInquiryModal open={contactOpen} onClose={() => setContactOpen(false)} venue={venue} />
    </DetailLayout>
  )
}
