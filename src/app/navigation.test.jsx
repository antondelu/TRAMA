import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'
import { AppProviders } from './providers/AppProviders'
import { freshDemo } from '@/test/helpers'

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<AppProviders><RouterProvider router={router} /></AppProviders>)
  return router
}

beforeEach(() => freshDemo())

describe('navegación', () => {
  it('la home muestra el hero y las cuatro categorías', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { level: 1, name: /todo lo que necesitás para/i })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Accesos rápidos' })
    for (const name of ['Salas', 'Espectáculos', 'Servicios', 'Recursos']) expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
  })

  it('los filtros en la URL cambian los resultados del catálogo', async () => {
    renderAt('/salas')
    expect(await screen.findByText('7 salas')).toBeInTheDocument()
  })

  it('el filtro de capacidad mínima reduce los resultados', async () => {
    renderAt('/salas?capMin=300')
    expect(await screen.findByText('3 salas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Desde: 300 personas/ })).toBeInTheDocument()
  })

  it('una tarjeta abre su detalle', async () => {
    const user = userEvent.setup()
    const router = renderAt('/espectaculos')
    await user.click(await screen.findByRole('link', { name: 'El peso del andamio' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'El peso del andamio' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/espectaculos/el-peso-del-andamio')
  })

  it('las rutas de cuenta piden iniciar sesión y vuelven después', async () => {
    const router = renderAt('/mi-cuenta/favoritos')
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
    expect(router.state.location.search).toContain('volver=%2Fmi-cuenta%2Ffavoritos')
    await userEvent.setup().click(screen.getByRole('button', { name: /Mateo Silvera/ }))
    expect(await screen.findByRole('heading', { name: 'Favoritos' })).toBeInTheDocument()
  })

  it('el panel de administración rechaza a quien no tiene permiso', async () => {
    freshDemo('u-mateo')
    renderAt('/admin')
    expect(await screen.findByText('No tenés acceso a esta sección')).toBeInTheDocument()
  })

  it('un recurso exclusivo muestra el bloqueo a visitantes', async () => {
    renderAt('/recursos/guia-organizar-gira-interior')
    expect(await screen.findByRole('heading', { name: 'Contenido exclusivo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver planes' })).toHaveAttribute('href', '/planes')
  })

  it('el registro valida los campos y muestra errores accesibles', async () => {
    const user = userEvent.setup()
    renderAt('/registro')
    await user.click(await screen.findByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Escribí tu nombre')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nombre/)).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText(/^Contraseña/), 'corta')
    await user.type(screen.getByLabelText(/^Repetir contraseña/), 'otra')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('un borrador de sala se guarda y aparece en Mis publicaciones', async () => {
    freshDemo('u-joaquin')
    const user = userEvent.setup()
    const router = renderAt('/publicar/sala')
    // Enviar vacío no navega y marca errores
    await user.click(await screen.findByRole('button', { name: 'Enviar a moderación' }))
    expect(await screen.findByText('Revisá los campos marcados en rojo.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/publicar/sala')
    // Guardar borrador solo exige el nombre
    await user.type(screen.getByLabelText(/^Nombre/), 'Sala del Puerto')
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))
    expect(await screen.findByRole('heading', { name: 'Mis publicaciones' })).toBeInTheDocument()
    expect(await screen.findByText('Sala del Puerto')).toBeInTheDocument()
  })

  it('una ruta inexistente muestra la página 404', async () => {
    renderAt('/no-existe')
    expect(await screen.findByText('Se cortó el hilo.')).toBeInTheDocument()
  })

  it('un detalle inexistente muestra "no encontrado"', async () => {
    renderAt('/salas/no-existe')
    expect(await screen.findByText('No encontramos esto')).toBeInTheDocument()
  })
})
