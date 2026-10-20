// Semilla del modo demo: todas las colecciones juntas.
import { users } from './users'
import { venues } from './venues'
import { buildAvailability } from './availability'
import { shows } from './shows'
import { professionals } from './professionals'
import { opportunities } from './opportunities'
import { resources } from './resources'
import { membershipPlans, memberships } from './memberships'
import { bookingRequests, venueInquiries, showInquiries, serviceInquiries, applications } from './requests'
import { conversations, messages, notifications, favorites } from './messaging'
import { TAXONOMIES } from '@/constants/taxonomies'

export function buildSeed() {
  return structuredClone({
    users, venues, venueAvailability: buildAvailability(), shows, professionals, opportunities, resources,
    membershipPlans, memberships, bookingRequests, venueInquiries, showInquiries, serviceInquiries, applications,
    conversations, messages, notifications, favorites,
    taxonomies: TAXONOMIES,
    auditLog: [],
  })
}
