import { MapPin, Users } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { useTaxonomies } from '@/hooks/useTaxonomies'

// Versión minimalista: tipo, ciudad, capacidad y precio. El equipamiento y
// la disponibilidad se ven en la ficha de la sala.
export function VenueCard({ venue }) {
  const { label } = useTaxonomies()
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
      footer={<PriceDisplay from={venue.priceFrom} unit={venue.priceUnit} currency={venue.currency} />}
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <CardMeta icon={MapPin}>{venue.city}</CardMeta>
        <CardMeta icon={Users}>{venue.capacity} personas</CardMeta>
      </div>
    </EntityCard>
  )
}
