// DATOS DE DEMOSTRACIÓN. Los precios son de ejemplo y no son definitivos.
// No se procesa ningún pago: cambiar de plan en la demo solo cambia datos locales.

export const membershipPlans = [
  {
    id: 'plan-comunidad', name: 'Comunidad', description: 'Para explorar TRAMA y participar del mercado.',
    price: 0, priceYearly: 0, currency: 'UYU', billingPeriod: 'free',
    benefits: ['Explorar salas, espectáculos, servicios y oportunidades', 'Guardar favoritos', 'Publicar y recibir solicitudes', 'Recursos de acceso libre'],
    limits: ['Hasta 3 publicaciones activas'], accessRules: ['public'], isActive: true, demoPrice: true,
  },
  {
    id: 'plan-miembro', name: 'Miembro', description: 'Para profesionales que quieren formarse y crecer.',
    price: 390, priceYearly: 3900, currency: 'UYU', billingPeriod: 'monthly',
    benefits: ['Todo lo de Comunidad', 'Recursos exclusivos para miembros', 'Alertas de convocatorias por disciplina', 'Publicaciones ilimitadas'],
    limits: [], accessRules: ['public', 'member'], isActive: true, demoPrice: true,
  },
  {
    id: 'plan-profesional', name: 'Profesional', description: 'Para salas, compañías y productoras con actividad intensa.',
    price: 790, priceYearly: 7900, currency: 'UYU', billingPeriod: 'monthly',
    benefits: ['Todo lo de Miembro', 'Cursos y clases grabadas', 'Destacar publicaciones en el inicio', 'Estadísticas de tus publicaciones'],
    limits: [], accessRules: ['public', 'member', 'premium'], isActive: true, demoPrice: true,
  },
]

export const memberships = [
  { id: 'm-lucia', userId: 'u-lucia', planId: 'plan-miembro', status: 'active', billing: 'monthly', startAt: '2026-04-01T00:00:00Z', endAt: '2026-11-01T00:00:00Z', providerSubscriptionId: null },
  { id: 'm-sofia', userId: 'u-sofia', planId: 'plan-profesional', status: 'active', billing: 'yearly', startAt: '2026-06-01T00:00:00Z', endAt: '2027-06-01T00:00:00Z', providerSubscriptionId: null },
  { id: 'm-mateo', userId: 'u-mateo', planId: 'plan-miembro', status: 'expired', billing: 'monthly', startAt: '2026-05-01T00:00:00Z', endAt: '2026-09-01T00:00:00Z', providerSubscriptionId: null },
]
