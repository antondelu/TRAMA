// DATOS DE DEMOSTRACIÓN. Solicitudes en distintos estados.
// Cinco tipos separados, cada uno con su propio modelo:
// BookingRequest (alquiler de sala), VenueInquiry (pregunta a una sala),
// ShowInquiry (contratar un espectáculo), ServiceInquiry (contratar un servicio)
// y Application (postulación). `history` registra cada cambio de estado y
// `messages`, la conversación después del primer mensaje.

const h = (at, by, from, to, note = null) => ({ at, by, from, to, note })

export const bookingRequests = [
  {
    id: 'br-1', venueId: 'v-urdimbre', requesterId: 'u-mateo', date: '2026-11-21', timeSlot: 'noche',
    startDateTime: '2026-11-21T19:00:00-03:00', endDateTime: '2026-11-21T23:00:00-03:00',
    activityType: 'funcion', functionCount: 2, message: 'Queremos hacer dos funciones de El peso del andamio el mismo fin de semana.',
    status: 'sent', proposedDate: null,
    history: [h('2026-10-12T15:00:00Z', 'u-mateo', 'draft', 'sent')],
    createdAt: '2026-10-12T14:50:00Z', updatedAt: '2026-10-12T15:00:00Z',
  },
  {
    id: 'br-2', venueId: 'v-urdimbre', requesterId: 'u-sofia', date: '2026-12-05', timeSlot: 'noche',
    startDateTime: '2026-12-05T19:00:00-03:00', endDateTime: '2026-12-05T23:00:00-03:00',
    activityType: 'muestra', functionCount: 1, message: 'Muestra de cierre de un taller del festival.',
    status: 'accepted', proposedDate: null,
    history: [h('2026-09-20T12:00:00Z', 'u-sofia', 'draft', 'sent'), h('2026-09-22T12:00:00Z', 'u-lucia', 'sent', 'accepted')],
    createdAt: '2026-09-20T12:00:00Z', updatedAt: '2026-09-22T12:00:00Z',
  },
  {
    id: 'br-3', venueId: 'v-telar', requesterId: 'u-joaquin', date: '2026-11-08', timeSlot: 'dia-completo',
    startDateTime: '2026-11-08T09:00:00-03:00', endDateTime: '2026-11-08T23:00:00-03:00',
    activityType: 'grabacion', functionCount: 0, message: 'Grabación de un corto con escenas de circo.',
    status: 'in_conversation', proposedDate: '2026-11-15',
    history: [h('2026-10-05T12:00:00Z', 'u-joaquin', 'draft', 'sent'), h('2026-10-06T12:00:00Z', 'u-lucia', 'sent', 'in_conversation', 'Propuesta de otra fecha: 15 de noviembre.')],
    createdAt: '2026-10-05T12:00:00Z', updatedAt: '2026-10-06T12:00:00Z',
  },
  {
    // Misma fecha que br-1: conflicto sin resolver, que la sala tiene que decidir.
    id: 'br-4', venueId: 'v-urdimbre', requesterId: 'u-joaquin', date: '2026-11-21', timeSlot: 'tarde',
    startDateTime: '2026-11-21T14:00:00-03:00', endDateTime: '2026-11-21T18:00:00-03:00',
    activityType: 'ensayo', functionCount: 0, message: 'Ensayo general de una muestra de egreso.',
    status: 'sent', proposedDate: null,
    history: [h('2026-10-14T12:00:00Z', 'u-joaquin', 'draft', 'sent')],
    createdAt: '2026-10-14T12:00:00Z', updatedAt: '2026-10-14T12:00:00Z',
  },
  {
    id: 'br-5', venueId: 'v-bastidor', requesterId: 'u-mateo', date: '2027-01-16', timeSlot: 'noche',
    startDateTime: '2027-01-16T19:00:00-03:00', endDateTime: '2027-01-16T23:00:00-03:00',
    activityType: 'funcion', functionCount: 4, message: 'Temporada corta en enero.',
    status: 'rejected', proposedDate: null,
    history: [h('2026-09-01T12:00:00Z', 'u-mateo', 'draft', 'sent'), h('2026-09-03T12:00:00Z', 'u-ines', 'sent', 'rejected', 'La temporada de enero ya está completa.')],
    createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-03T12:00:00Z',
  },
]

const m = (id, at, by, body) => ({ id, at, by, body })

export const venueInquiries = [
  {
    id: 'vi-1', venueId: 'v-urdimbre', requesterId: 'u-sofia',
    message: '¿La sala tiene parrilla de luces fija o hay que traer el equipo? Estamos armando una gira en marzo.',
    status: 'sent', history: [h('2026-10-18T12:00:00Z', 'u-sofia', 'draft', 'sent')], messages: [],
    createdAt: '2026-10-18T12:00:00Z', updatedAt: '2026-10-18T12:00:00Z',
  },
]

export const showInquiries = [
  {
    id: 'si-1', showId: 's-andamio', requesterId: 'u-sofia', organization: 'Festival Escena Litoral (ficticio)', venueName: 'Patio Proscenio',
    requestedDates: '12 al 14 de febrero de 2027', functionCount: 3, message: 'Nos interesa la obra para la programación del festival.',
    status: 'in_conversation',
    history: [h('2026-10-01T12:00:00Z', 'u-sofia', 'draft', 'sent'), h('2026-10-02T12:00:00Z', 'u-mateo', 'sent', 'in_conversation')],
    messages: [
      m('si-1-m1', '2026-10-02T12:00:00Z', 'u-mateo', '¡Gracias! Podemos hacer las tres funciones. ¿El patio tiene piso de madera?'),
      m('si-1-m2', '2026-10-02T15:00:00Z', 'u-sofia', 'Sí, piso de madera de 8 × 6 m. Te paso la ficha técnica por acá cuando la tenga.'),
    ],
    createdAt: '2026-10-01T12:00:00Z', updatedAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'si-2', showId: 's-raices', requesterId: 'u-lucia', organization: 'Sala Urdimbre', venueName: 'Sala Urdimbre',
    requestedDates: 'Marzo de 2027', functionCount: 4, message: '¿Pueden adaptar la pieza a una sala de 9 x 8 metros?',
    status: 'sent', history: [h('2026-10-15T12:00:00Z', 'u-lucia', 'draft', 'sent')],
    createdAt: '2026-10-15T12:00:00Z', updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'si-3', showId: 's-lona', requesterId: 'u-lucia', organization: 'Galpón Telar', venueName: 'Galpón Telar',
    requestedDates: 'Vacaciones de julio de 2027', functionCount: 6, message: 'Borrador: confirmar fechas con el equipo.',
    status: 'draft', history: [], createdAt: '2026-10-17T12:00:00Z', updatedAt: '2026-10-17T12:00:00Z',
  },
]

export const serviceInquiries = [
  {
    id: 'sv-1', serviceId: 'p-luz-silvera', requesterId: 'u-lucia', projectType: 'Diseño de luces para un ciclo de danza',
    projectDescription: 'Ciclo de cuatro piezas cortas en Sala Urdimbre. Necesitamos un diseño base adaptable.',
    requestedDate: '2027-03-01', location: 'Montevideo', budget: 20000, message: '',
    status: 'sent', history: [h('2026-10-16T12:00:00Z', 'u-lucia', 'draft', 'sent')],
    createdAt: '2026-10-16T12:00:00Z', updatedAt: '2026-10-16T12:00:00Z',
  },
  {
    id: 'sv-2', serviceId: 'p-foco', requesterId: 'u-mateo', projectType: 'Fotos de prensa',
    projectDescription: 'Sesión de fotos de prensa para la reposición de El peso del andamio.',
    requestedDate: '2026-08-20', location: 'Montevideo', budget: 8000, message: '',
    status: 'completed',
    history: [h('2026-08-01T12:00:00Z', 'u-mateo', 'draft', 'sent'), h('2026-08-02T12:00:00Z', 'u-ines', 'sent', 'accepted'), h('2026-08-21T12:00:00Z', 'u-ines', 'accepted', 'completed')],
    createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-08-21T12:00:00Z',
  },
]

export const applications = [
  {
    id: 'ap-1', opportunityId: 'o-urdimbre-2027', applicantId: 'u-mateo', showId: 's-andamio',
    proposal: 'Proponemos cuatro funciones de El peso del andamio en abril de 2027.', attachments: [],
    status: 'under_review',
    history: [h('2026-10-08T12:00:00Z', 'u-mateo', null, 'sent'), h('2026-10-10T12:00:00Z', 'u-lucia', 'sent', 'under_review')],
    createdAt: '2026-10-08T12:00:00Z', updatedAt: '2026-10-10T12:00:00Z',
  },
  {
    id: 'ap-2', opportunityId: 'o-litoral-festival', applicantId: 'u-tomas', showId: 's-lona',
    proposal: 'Bajo la lona funciona muy bien en exterior y podemos hacer dos funciones por día.', attachments: [],
    status: 'shortlisted',
    history: [h('2026-09-20T12:00:00Z', 'u-tomas', null, 'sent'), h('2026-09-25T12:00:00Z', 'u-sofia', 'sent', 'under_review'), h('2026-10-03T12:00:00Z', 'u-sofia', 'under_review', 'shortlisted')],
    createdAt: '2026-09-20T12:00:00Z', updatedAt: '2026-10-03T12:00:00Z',
  },
  {
    id: 'ap-3', opportunityId: 'o-litoral-festival', applicantId: 'u-camila', showId: 's-raices',
    proposal: 'Versión para exterior de Raíces de aire.', attachments: [],
    status: 'sent', history: [h('2026-10-11T12:00:00Z', 'u-camila', null, 'sent')],
    createdAt: '2026-10-11T12:00:00Z', updatedAt: '2026-10-11T12:00:00Z',
  },
]
