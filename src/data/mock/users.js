// DATOS DE DEMOSTRACIÓN. Personas ficticias: cualquier parecido es casual.
// No hay contraseñas: en modo demo el ingreso no verifica credenciales.
// Los datos privados (email, teléfono) nunca se muestran en perfiles públicos.

export const users = [
  {
    id: 'u-lucia', email: 'lucia.demo@trama.test', firstName: 'Lucía', lastName: 'Barreiro',
    avatar: null, bio: 'Gestora cultural. Coordina la programación de dos salas independientes en Montevideo.',
    country: 'UY', city: 'Montevideo', interests: ['salas', 'espectaculos'], roles: ['user'], status: 'active',
    specialties: [], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: true }, notificationPrefs: { email: true, requests: true, opportunities: true, messages: true },
    demoLabel: 'Responsable de sala · Miembro',
    createdAt: '2026-03-02T14:10:00Z', updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'u-mateo', email: 'mateo.demo@trama.test', firstName: 'Mateo', lastName: 'Silvera',
    avatar: null, bio: 'Director de la compañía Los del Andamio. También trabaja como iluminador.',
    country: 'UY', city: 'Montevideo', interests: ['espectaculos', 'servicios', 'recursos'], roles: ['user'], status: 'active',
    specialties: ['iluminacion'], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: true }, notificationPrefs: { email: true, requests: true, opportunities: true, messages: true },
    demoLabel: 'Compañía · Profesional de servicios',
    createdAt: '2026-04-11T19:30:00Z', updatedAt: '2026-10-02T09:12:00Z',
  },
  {
    id: 'u-valentina', email: 'valentina.demo@trama.test', firstName: 'Valentina', lastName: 'Ocampo',
    avatar: null, bio: 'Editora de la biblioteca de Recursos y moderadora de publicaciones.',
    country: 'UY', city: 'Montevideo', interests: ['recursos'], roles: ['user', 'editor', 'moderator'], status: 'active',
    specialties: [], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: false }, notificationPrefs: { email: true, requests: false, opportunities: false, messages: true },
    demoLabel: 'Editora · Moderadora',
    createdAt: '2026-01-20T12:00:00Z', updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'u-andres', email: 'admin.demo@trama.test', firstName: 'Andrés', lastName: 'Pereyra',
    avatar: null, bio: 'Administración de la plataforma.',
    country: 'UY', city: 'Montevideo', interests: [], roles: ['user', 'admin'], status: 'active',
    specialties: [], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: false }, notificationPrefs: { email: true, requests: false, opportunities: false, messages: true },
    demoLabel: 'Administrador',
    createdAt: '2026-01-05T12:00:00Z', updatedAt: '2026-01-05T12:00:00Z',
  },
  {
    id: 'u-sofia', email: 'sofia.demo@trama.test', firstName: 'Sofía', lastName: 'Rial',
    avatar: null, bio: 'Programadora del festival ficticio Escena Litoral. Busca obras para giras por el interior.',
    country: 'UY', city: 'Salto', interests: ['espectaculos', 'recursos'], roles: ['user'], status: 'active',
    specialties: ['produccion'], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: true }, notificationPrefs: { email: false, requests: true, opportunities: true, messages: true },
    demoLabel: 'Programadora · Miembro Profesional',
    createdAt: '2026-05-14T16:45:00Z', updatedAt: '2026-09-30T11:00:00Z',
  },
  {
    id: 'u-joaquin', email: 'joaquin.demo@trama.test', firstName: 'Joaquín', lastName: 'Méndez',
    avatar: null, bio: 'Recién llegado a TRAMA. Actor y estudiante de dramaturgia.',
    country: 'UY', city: 'Canelones', interests: ['recursos', 'oportunidades'], roles: ['user'], status: 'active',
    specialties: [], links: [], publicContact: { showEmail: false, phone: null },
    privacy: { profilePublic: true }, notificationPrefs: { email: true, requests: true, opportunities: true, messages: true },
    demoLabel: 'Usuario registrado, sin membresía',
    createdAt: '2026-10-10T20:00:00Z', updatedAt: '2026-10-10T20:00:00Z',
  },
  // Cuentas dueñas de publicaciones de la demo (no aparecen como acceso rápido).
  { id: 'u-ines', email: 'ines.demo@trama.test', firstName: 'Inés', lastName: 'Cabrera', avatar: null, bio: '', country: 'UY', city: 'Maldonado', interests: [], roles: ['user'], status: 'active', specialties: [], links: [], publicContact: { showEmail: false, phone: null }, privacy: { profilePublic: true }, notificationPrefs: {}, createdAt: '2026-02-12T12:00:00Z', updatedAt: '2026-02-12T12:00:00Z' },
  { id: 'u-tomas', email: 'tomas.demo@trama.test', firstName: 'Tomás', lastName: 'Arrieta', avatar: null, bio: '', country: 'UY', city: 'Paysandú', interests: [], roles: ['user'], status: 'active', specialties: [], links: [], publicContact: { showEmail: false, phone: null }, privacy: { profilePublic: true }, notificationPrefs: {}, createdAt: '2026-02-20T12:00:00Z', updatedAt: '2026-02-20T12:00:00Z' },
  { id: 'u-camila', email: 'camila.demo@trama.test', firstName: 'Camila', lastName: 'Duarte', avatar: null, bio: '', country: 'UY', city: 'Montevideo', interests: [], roles: ['user'], status: 'active', specialties: [], links: [], publicContact: { showEmail: false, phone: null }, privacy: { profilePublic: true }, notificationPrefs: {}, createdAt: '2026-03-08T12:00:00Z', updatedAt: '2026-03-08T12:00:00Z' },
  { id: 'u-bruno', email: 'bruno.demo@trama.test', firstName: 'Bruno', lastName: 'Lemos', avatar: null, bio: '', country: 'UY', city: 'Colonia del Sacramento', interests: [], roles: ['user'], status: 'suspended', specialties: [], links: [], publicContact: { showEmail: false, phone: null }, privacy: { profilePublic: true }, notificationPrefs: {}, createdAt: '2026-04-02T12:00:00Z', updatedAt: '2026-07-15T12:00:00Z' },
]

// Accesos rápidos que ofrece la pantalla de ingreso en modo demo.
export const DEMO_LOGINS = ['u-lucia', 'u-mateo', 'u-sofia', 'u-joaquin', 'u-valentina', 'u-andres']
