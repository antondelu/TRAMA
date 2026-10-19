// Configuración general de la app. Lo que dependa del país o del entorno se
// lee de acá, para poder sumar países, monedas o un backend real sin tocar páginas.

export const APP = {
  name: 'TRAMA',
  descriptor: 'Mercado profesional de las artes escénicas',
  // Modo demo: los datos son ficticios y viven en la memoria de esta pestaña.
  // Cuando exista una API, poner VITE_API_URL y cambiar el adaptador en services/adapter.
  demoMode: !import.meta.env.VITE_API_URL,
  apiUrl: import.meta.env.VITE_API_URL ?? null,
  contactEmail: null, // sin definir: no se muestra un correo inventado
}

export const LOCALE = {
  defaultCountry: 'UY',
  language: 'es-UY',
  currency: 'UYU',
  timezone: 'America/Montevideo',
}

// Política de contraseñas compartida por registro y cambio de contraseña.
export const PASSWORD_POLICY = {
  minLength: 8,
  description: 'Mínimo 8 caracteres, con al menos una letra y un número.',
}

export const PAGE_SIZE = 6
