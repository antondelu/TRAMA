// Sponsors de la temporada, que ocupan butacas en el plano de platea y
// aparecen con su logo y nombre debajo del plano.
// Para sumar uno, subir el logo (SVG o PNG con fondo transparente, idealmente
// horizontal) a public/sponsors/ y agregar:
//   { id: 'marca', name: 'Marca', url: 'https://...', logo: '/sponsors/marca.svg' }
//
// DATOS DE DEMOSTRACIÓN: las marcas de abajo son ficticias (nombres y logos
// inventados, enlaces a example.org). Reemplazarlas por sponsors reales, o
// dejar la lista vacía, antes de publicar.
export const SPONSORS = [
  { id: 'cafe-bambalina', name: 'Café Bambalina', url: 'https://example.org/cafe-bambalina', logo: '/sponsors/cafe-bambalina.svg', demo: true },
  { id: 'imprenta-proscenio', name: 'Imprenta Proscenio', url: 'https://example.org/imprenta-proscenio', logo: '/sponsors/imprenta-proscenio.svg', demo: true },
  { id: 'fundacion-telon-arriba', name: 'Fundación Telón Arriba', url: 'https://example.org/fundacion-telon-arriba', logo: '/sponsors/fundacion-telon-arriba.svg', demo: true },
  { id: 'cooperativa-la-butaca', name: 'Cooperativa La Butaca', url: 'https://example.org/cooperativa-la-butaca', logo: '/sponsors/cooperativa-la-butaca.svg', demo: true },
]
