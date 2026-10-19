import { MapPin, Briefcase, Laptop } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'

export const SERVICE_AVAILABILITY_TONE = { disponible: 'success', 'agenda-limitada': 'warning', 'sin-disponibilidad': 'neutral' }

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
      footer={<span className="text-xs">{label('providerTypes', pro.providerType)}</span>}
    >
      <p className="line-clamp-2 text-ink">{pro.description}</p>
      <CardMeta icon={MapPin}>{pro.location.city}</CardMeta>
      <CardMeta icon={Laptop}>{labels('workModes', pro.workModes).join(' y ')}</CardMeta>
      {pro.portfolio?.length > 0 && <CardMeta icon={Briefcase}>{pro.portfolio.length} {pro.portfolio.length === 1 ? 'trabajo' : 'trabajos'} en portfolio</CardMeta>}
    </EntityCard>
  )
}
