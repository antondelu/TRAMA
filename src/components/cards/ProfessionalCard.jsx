import { MapPin } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'

export const SERVICE_AVAILABILITY_TONE = { disponible: 'success', 'agenda-limitada': 'warning', 'sin-disponibilidad': 'neutral' }

// Versión minimalista: especialidad, ciudad y disponibilidad.
export function ProfessionalCard({ pro }) {
  const { label, labels } = useTaxonomies()
  return (
    <EntityCard
      to={`/servicios/${pro.slug}`}
      title={pro.name}
      eyebrow={labels('specialties', pro.specialties.slice(0, 2)).join(' · ')}
      image={pro.images?.[0]?.url}
      kind="service"
      favorite={{ type: 'service', id: pro.id }}
      badges={pro.availability && <Badge tone={SERVICE_AVAILABILITY_TONE[pro.availability]}>{label('serviceAvailability', pro.availability)}</Badge>}
      cta="Ver perfil"
      footer={<CardMeta icon={MapPin}>{pro.location.city}</CardMeta>}
    />
  )
}
