// Integraciones externas. Cada una indica si está configurada; las pantallas
// usan esto para no simular algo que todavía no existe.

// En la web, /api está en el mismo dominio que el sitio. Las apps de Android e
// iOS no tienen servidor propio: su build define VITE_SITE_URL (ver .env.mobile).
const SITE = import.meta.env.VITE_SITE_URL ?? ''

export const INTEGRATIONS = {
  // Formulario de contacto: api/server.mjs (SMTP). Funciona si la API corre.
  contact: { endpoint: `${SITE}/api/contact`, challenge: `${SITE}/api/challenge` },

  // Noticias de artes escénicas: news/server.mjs. Datos reales, también en modo demo.
  news: { endpoint: `${SITE}/api/news` },

  // Pendientes de infraestructura real:
  auth: { provider: null, note: 'Autenticación real pendiente (ej. Auth0, Supabase Auth, Cognito o backend propio).' },
  payments: { provider: null, note: 'Cobro de membresías pendiente (ej. Mercado Pago o Stripe).' },
  storage: { provider: null, note: 'Subida de archivos pendiente (ej. S3, Cloudinary).' },
  email: { provider: null, note: 'Notificaciones por correo pendientes.' },
}
