import { MapPin, Users, Wrench, CalendarCheck } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatShortDate } from '@/utils/format'

export function VenueCard({ venue }) {
  const { label, labels } = useTaxonomies()
  return (
    <EntityCard
      to={`/salas/${venue.slug}`}
      title={venue.name}
      eyebrow={label('venueTypes', venue.venueType)}
      image={venue.images?.[0]?.url}
      kind="venue"
      favorite={{ type: 'venue', id: venue.id }}
      badges={venue.hasOpenCall && <Badge tone="accent">Convocatoria abierta</Badge>}
      cta="Ver sala"
      footer={<PriceDisplay from={venue.priceFrom} to={venue.priceTo} unit={venue.priceUnit} currency={venue.currency} />}
    >
      <CardMeta icon={MapPin}>{venue.city}{venue.address?.area ? ` · ${venue.address.area}` : ''}</CardMeta>
      <CardMeta icon={Users}>Hasta {venue.capacity} personas</CardMeta>
      <CardMeta icon={Wrench}>{labels('equipment', venue.equipment.slice(0, 3)).join(', ')}</CardMeta>
      {/* Solo si la sala cargó disponibilidad */}
      {venue.nextAvailable && <CardMeta icon={CalendarCheck}>Próxima fecha libre: {formatShortDate(venue.nextAvailable)}</CardMeta>}
    </EntityCard>
  )
}
