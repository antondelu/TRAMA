// DATOS DE DEMOSTRACIÓN. Conversaciones y notificaciones simuladas.
// No hay chat en tiempo real: los mensajes nuevos se ven al recargar la vista.

export const conversations = [
  { id: 'c-1', participantIds: ['u-lucia', 'u-mateo'], relatedEntityType: 'bookingRequest', relatedEntityId: 'br-1', subject: 'Reserva en Sala Urdimbre', createdAt: '2026-10-12T15:00:00Z', updatedAt: '2026-10-13T11:20:00Z' },
  { id: 'c-2', participantIds: ['u-sofia', 'u-mateo'], relatedEntityType: 'showInquiry', relatedEntityId: 'si-1', subject: 'El peso del andamio en Escena Litoral', createdAt: '2026-10-01T12:00:00Z', updatedAt: '2026-10-03T18:05:00Z' },
  { id: 'c-3', participantIds: ['u-lucia', 'u-joaquin'], relatedEntityType: 'bookingRequest', relatedEntityId: 'br-3', subject: 'Grabación en Galpón Telar', createdAt: '2026-10-06T12:00:00Z', updatedAt: '2026-10-06T12:05:00Z' },
]

export const messages = [
  { id: 'msg-1', conversationId: 'c-1', senderId: 'u-mateo', body: 'Hola Lucía, mandé la solicitud para el 21 de noviembre. ¿La parrilla tiene 24 canales?', readAt: '2026-10-12T18:00:00Z', createdAt: '2026-10-12T15:02:00Z' },
  { id: 'msg-2', conversationId: 'c-1', senderId: 'u-lucia', body: 'Hola Mateo. Sí, 24 canales. Tengo otra consulta para esa fecha, te confirmo esta semana.', readAt: null, createdAt: '2026-10-13T11:20:00Z' },
  { id: 'msg-3', conversationId: 'c-2', senderId: 'u-sofia', body: 'Nos encantó la obra. ¿El andamio entra en el escenario del Patio Proscenio?', readAt: '2026-10-02T10:00:00Z', createdAt: '2026-10-01T12:05:00Z' },
  { id: 'msg-4', conversationId: 'c-2', senderId: 'u-mateo', body: 'Sí, mide 4 metros de alto y se arma en dos horas. Te paso la ficha técnica.', readAt: '2026-10-03T09:00:00Z', createdAt: '2026-10-02T12:10:00Z' },
  { id: 'msg-5', conversationId: 'c-2', senderId: 'u-sofia', body: 'Perfecto. La comparto con el equipo técnico y te escribo.', readAt: null, createdAt: '2026-10-03T18:05:00Z' },
  { id: 'msg-6', conversationId: 'c-3', senderId: 'u-lucia', body: 'Joaquín, el 8 ya está tomado. ¿Te sirve el 15 de noviembre?', readAt: null, createdAt: '2026-10-06T12:05:00Z' },
]

// type: new_request | request_response | status_change | opportunity_closing |
//       new_message | membership | admin_notice
export const notifications = [
  { id: 'n-1', userId: 'u-lucia', type: 'new_request', title: 'Nueva solicitud de reserva', body: 'Mateo Silvera pidió Sala Urdimbre para el 21 de noviembre.', targetUrl: '/mi-cuenta/solicitudes', readAt: null, createdAt: '2026-10-12T15:00:00Z' },
  { id: 'n-2', userId: 'u-lucia', type: 'new_request', title: 'Otra solicitud para el 21 de noviembre', body: 'Hay dos solicitudes para la misma fecha. Revisalas en el calendario.', targetUrl: '/mi-cuenta/calendario', readAt: null, createdAt: '2026-10-14T12:00:00Z' },
  { id: 'n-3', userId: 'u-lucia', type: 'membership', title: 'Tu membresía se renueva pronto', body: 'El plan Miembro vence el 1 de noviembre. (Demo: no hay cobros reales.)', targetUrl: '/mi-cuenta/membresia', readAt: '2026-10-10T12:00:00Z', createdAt: '2026-10-09T12:00:00Z' },
  { id: 'n-4', userId: 'u-mateo', type: 'status_change', title: 'Tu postulación está en revisión', body: 'Sala Urdimbre pasó tu propuesta a revisión.', targetUrl: '/mi-cuenta/solicitudes', readAt: null, createdAt: '2026-10-10T12:00:00Z' },
  { id: 'n-5', userId: 'u-mateo', type: 'new_message', title: 'Nuevo mensaje de Lucía Barreiro', body: 'Sobre la reserva en Sala Urdimbre.', targetUrl: '/mi-cuenta/mensajes', readAt: null, createdAt: '2026-10-13T11:20:00Z' },
  { id: 'n-6', userId: 'u-mateo', type: 'opportunity_closing', title: 'Una convocatoria guardada cierra pronto', body: 'Festival Escena Litoral cierra el 31 de octubre.', targetUrl: '/oportunidades/festival-escena-litoral-2027', readAt: null, createdAt: '2026-10-17T12:00:00Z' },
  { id: 'n-7', userId: 'u-sofia', type: 'new_message', title: 'Nuevo mensaje de Mateo Silvera', body: 'Sobre El peso del andamio.', targetUrl: '/mi-cuenta/mensajes', readAt: '2026-10-03T09:00:00Z', createdAt: '2026-10-02T12:10:00Z' },
  { id: 'n-8', userId: 'u-joaquin', type: 'request_response', title: 'Galpón Telar respondió tu solicitud', body: 'Te propusieron otra fecha: 15 de noviembre.', targetUrl: '/mi-cuenta/solicitudes', readAt: null, createdAt: '2026-10-06T12:00:00Z' },
  { id: 'n-9', userId: 'u-valentina', type: 'admin_notice', title: 'Publicaciones pendientes de moderación', body: 'Hay publicaciones nuevas esperando revisión.', targetUrl: '/admin/publicaciones', readAt: null, createdAt: '2026-10-15T12:00:00Z' },
]

export const favorites = [
  { id: 'f-1', userId: 'u-lucia', entityType: 'show', entityId: 's-raices', createdAt: '2026-10-14T12:00:00Z' },
  { id: 'f-2', userId: 'u-lucia', entityType: 'service', entityId: 'p-benitez', createdAt: '2026-10-11T12:00:00Z' },
  { id: 'f-3', userId: 'u-mateo', entityType: 'venue', entityId: 'v-bastidor', createdAt: '2026-09-01T12:00:00Z' },
  { id: 'f-4', userId: 'u-mateo', entityType: 'opportunity', entityId: 'o-litoral-festival', createdAt: '2026-09-18T12:00:00Z' },
  { id: 'f-5', userId: 'u-mateo', entityType: 'resource', entityId: 'r-guia-giras', createdAt: '2026-09-22T12:00:00Z' },
  { id: 'f-6', userId: 'u-sofia', entityType: 'show', entityId: 's-lona', createdAt: '2026-09-21T12:00:00Z' },
]
