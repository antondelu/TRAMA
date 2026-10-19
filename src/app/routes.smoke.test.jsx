import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'
import { AppProviders } from './providers/AppProviders'
import { freshDemo } from '@/test/helpers'

// Abre cada ruta directamente (como si se escribiera la URL) y comprueba que
// se renderiza su contenido sin errores de consola.
const CASES = [
  ['/', null, /todo lo que necesitás/i],
  ['/buscar?q=luz', null, /Resultados para/],
  ['/salas', null, 'Encontrá tu próximo escenario.'],
  ['/salas/sala-urdimbre', null, 'Sala Urdimbre'],
  ['/espectaculos', null, 'Obras para programar.'],
  ['/espectaculos/el-peso-del-andamio', null, 'El peso del andamio'],
  ['/servicios', null, 'Profesionales para tu proyecto.'],
  ['/servicios/laura-benitez-luces', null, 'Laura Benítez'],
  ['/oportunidades', null, 'Convocatorias abiertas.'],
  ['/oportunidades/programacion-sala-urdimbre-2027', null, 'Programación primer semestre 2027'],
  ['/oportunidades/seleccion-ciclo-titeres', null, 'Selección para ciclo de títeres en escuelas'],
  ['/recursos', null, 'Biblioteca profesional.'],
  ['/recursos/plantilla-presupuesto-produccion', null, 'Plantilla de presupuesto de producción'],
  ['/planes', null, 'Planes para crecer en el sector.'],
  ['/como-funciona', null, 'Un mercado hecho para el sector.'],
  ['/nosotros', null, 'Hilos que sostienen la escena.'],
  ['/privacidad', null, 'Política de privacidad'],
  ['/terminos', null, 'Términos y condiciones'],
  ['/ingresar', null, 'Ingresar'],
  ['/registro', null, 'Crear cuenta'],
  ['/recuperar-contrasena', null, 'Recuperar contraseña'],
  ['/mi-cuenta', 'u-lucia', 'Hola, Lucía'],
  ['/mi-cuenta/perfil', 'u-lucia', 'Perfil'],
  ['/mi-cuenta/favoritos', 'u-lucia', 'Favoritos'],
  ['/mi-cuenta/mensajes?c=c-1', 'u-lucia', 'Mensajes'],
  ['/mi-cuenta/solicitudes', 'u-lucia', 'Solicitudes y contrataciones'],
  ['/mi-cuenta/publicaciones', 'u-lucia', 'Mis publicaciones'],
  ['/mi-cuenta/notificaciones', 'u-lucia', 'Notificaciones'],
  ['/mi-cuenta/membresia', 'u-lucia', 'Membresía'],
  ['/mi-cuenta/configuracion', 'u-lucia', 'Configuración'],
  ['/mi-cuenta/calendario', 'u-lucia', 'Calendario y reservas'],
  ['/mi-cuenta/recursos/gestion', 'u-valentina', 'Gestión de recursos'],
  ['/publicar', 'u-joaquin', '¿Qué querés publicar?'],
  ['/publicar/sala', 'u-joaquin', 'Registrá tu sala'],
  ['/publicar/sala?id=v-urdimbre', 'u-lucia', 'Editar sala'],
  ['/publicar/espectaculo', 'u-joaquin', 'Publicá tu espectáculo'],
  ['/publicar/espectaculo?id=s-andamio', 'u-mateo', 'Editar espectáculo'],
  ['/publicar/servicio', 'u-joaquin', 'Sumate al directorio'],
  ['/publicar/convocatoria', 'u-lucia', 'Publicá una convocatoria'],
  ['/admin', 'u-andres', 'Resumen'],
  ['/admin/usuarios', 'u-andres', 'Usuarios'],
  ['/admin/publicaciones', 'u-valentina', 'Moderación'],
  ['/admin/oportunidades', 'u-valentina', 'Oportunidades'],
  ['/admin/recursos', 'u-valentina', 'Gestión editorial de recursos'],
  ['/admin/membresias', 'u-andres', 'Planes y membresías'],
  ['/admin/reportes', 'u-andres', 'Reportes y métricas'],
  ['/admin/configuracion', 'u-andres', 'Configuración general'],
]

let errors
beforeEach(() => {
  errors = []
  vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args.join(' ')))
})
afterEach(() => vi.restoreAllMocks())

describe('todas las rutas abren directamente', () => {
  it.each(CASES)('%s (%s)', async (path, userId, heading) => {
    freshDemo(userId)
    const router = createMemoryRouter(routes, { initialEntries: [path] })
    render(<AppProviders><RouterProvider router={router} /></AppProviders>)
    expect(await screen.findByRole('heading', { level: 1, name: heading }, { timeout: 3000 })).toBeInTheDocument()
    // Deja terminar las cargas de datos de la página.
    await waitFor(() => expect(screen.queryAllByRole('status', { name: /Cargando/ })).toHaveLength(0), { timeout: 3000 })
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument()
    expect(errors).toEqual([])
  })
})
