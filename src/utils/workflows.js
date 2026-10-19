// Máquinas de estado de TRAMA. Reservas de sala, consultas de contratación y
// postulaciones son procesos distintos: cada uno tiene sus estados y sus
// transiciones válidas, separadas por quién puede ejecutarlas
// (sender = quien envía, receiver = quien recibe).
// En producción estas mismas reglas deben validarse en el servidor.

const INQUIRY_FLOW = {
  draft: { sender: ['sent', 'cancelled'] },
  sent: { receiver: ['in_conversation', 'accepted', 'rejected'], sender: ['cancelled'] },
  in_conversation: { receiver: ['accepted', 'rejected'], sender: ['cancelled'] },
  accepted: { receiver: ['completed'], sender: ['cancelled'] },
}

export const REQUEST_KINDS = {
  booking: {
    label: 'Reserva de sala',
    collection: 'bookingRequests',
    // "Proponer otra fecha" lleva la solicitud a conversación con una fecha alternativa.
    transitions: INQUIRY_FLOW,
  },
  showInquiry: { label: 'Consulta de contratación', collection: 'showInquiries', transitions: INQUIRY_FLOW },
  serviceInquiry: { label: 'Consulta de servicio', collection: 'serviceInquiries', transitions: INQUIRY_FLOW },
  application: {
    label: 'Postulación',
    collection: 'applications',
    transitions: {
      sent: { receiver: ['under_review', 'rejected'], sender: ['withdrawn'] },
      under_review: { receiver: ['shortlisted', 'accepted', 'rejected'], sender: ['withdrawn'] },
      shortlisted: { receiver: ['accepted', 'rejected'], sender: ['withdrawn'] },
    },
  },
}

export const REQUEST_STATE_LABELS = {
  draft: 'Borrador',
  sent: 'Enviada',
  received: 'Recibida',
  in_conversation: 'En conversación',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  under_review: 'En revisión',
  shortlisted: 'Preseleccionada',
  withdrawn: 'Retirada',
}

export const TRANSITION_LABELS = {
  sent: 'Enviar',
  in_conversation: 'Responder',
  accepted: 'Aceptar',
  rejected: 'Rechazar',
  cancelled: 'Cancelar',
  completed: 'Marcar como completada',
  under_review: 'Pasar a revisión',
  shortlisted: 'Preseleccionar',
  withdrawn: 'Retirar postulación',
}

// "Enviada" se ve como "Recibida" del lado de quien la recibe.
export function stateLabelFor(state, side) {
  if (state === 'sent' && side === 'receiver') return REQUEST_STATE_LABELS.received
  return REQUEST_STATE_LABELS[state] ?? state
}

export function allowedTransitions(kind, state, side) {
  return REQUEST_KINDS[kind]?.transitions[state]?.[side] ?? []
}

export function canTransitionRequest(kind, from, to, side) {
  return allowedTransitions(kind, from, side).includes(to)
}

export const OPEN_REQUEST_STATES = ['draft', 'sent', 'in_conversation', 'under_review', 'shortlisted']

// Publicaciones (salas, espectáculos, servicios, convocatorias, recursos).
// Nada que pase por moderación se publica solo: el dueño lo envía a revisión
// y un moderador lo aprueba.
export const PUBLICATION_STATES = {
  draft: 'Borrador',
  pending: 'Pendiente de moderación',
  changes_requested: 'Cambios solicitados',
  published: 'Publicada',
  inactive: 'Desactivada',
  rejected: 'Rechazada',
  archived: 'Archivada',
}

export const PUBLICATION_TRANSITIONS = {
  draft: { owner: ['pending'] },
  changes_requested: { owner: ['pending', 'draft'] },
  pending: { owner: ['draft'], moderator: ['published', 'rejected', 'changes_requested'] },
  published: { owner: ['inactive'], moderator: ['archived', 'changes_requested'] },
  inactive: { owner: ['pending'], moderator: ['archived'] },
  rejected: { owner: ['draft'], moderator: ['archived'] },
  archived: { moderator: ['draft'] },
}

export function canTransitionPublication(from, to, actor) {
  return PUBLICATION_TRANSITIONS[from]?.[actor]?.includes(to) ?? false
}

export const PUBLICATION_ACTION_LABELS = {
  pending: 'Enviar a moderación',
  draft: 'Volver a borrador',
  published: 'Aprobar',
  rejected: 'Rechazar',
  changes_requested: 'Solicitar cambios',
  inactive: 'Desactivar',
  archived: 'Archivar',
}

// Estado de una convocatoria visto por el público. "Vencida" se calcula por
// fecha y no se guarda, así nunca queda desactualizado.
export const OPPORTUNITY_STATES = {
  ...PUBLICATION_STATES,
  closed: 'Cerrada',
  expired: 'Vencida',
}

export function opportunityPublicState(opportunity, today) {
  if (opportunity.status !== 'published') return opportunity.status
  if (opportunity.deadline < today) return 'expired'
  return 'published'
}
