import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import NewsPage from './NewsPage'

const item = (id, over = {}) => ({
  id, title: `Noticia ${id}`, summary: `Resumen ${id}`, url: `https://medio.example/${id}`, image: null,
  publishedAt: '2026-10-19T13:00:00.000Z', source: { name: 'la diaria', url: 'https://ladiaria.com.uy' },
  country: 'UY', countryName: 'Uruguay', department: 'Montevideo', city: null,
  disciplines: [{ id: 'teatro', label: 'Teatro' }], ...over,
})

const page = (section, items, extra = {}) => ({
  section, items, total: items.length, page: 1, pageCount: 1, hasMore: false,
  facets: {
    disciplines: [{ id: 'teatro', label: 'Teatro', count: 3 }, { id: 'danza', label: 'Danza', count: 1 }],
    locations: section === 'uy'
      ? [{ id: 'montevideo', label: 'Montevideo', count: 2, group: 'area' }, { id: 'interior', label: 'Interior', count: 2, group: 'area' }, { id: 'Salto', label: 'Salto', count: 2, group: 'department' }]
      : [{ id: 'latam', label: 'Latinoamérica', count: 1, group: 'area' }],
  },
  lastSuccessAt: '2026-10-19T12:00:00.000Z', lastRunAt: '2026-10-19T12:00:00.000Z', nextRunAt: '2026-10-19T13:00:00.000Z', ...extra,
})

const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

// Responde según la sección y la página pedidas; guarda cada URL consultada.
function mockNews(handler) {
  const calls = []
  vi.stubGlobal('fetch', vi.fn((url) => {
    const params = new URL(url, 'http://localhost').searchParams
    calls.push(params)
    return handler(params)
  }))
  return calls
}

function renderPage(path = '/noticias') {
  const router = createMemoryRouter([{ path: '/noticias', element: <NewsPage /> }], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const section = (name) => screen.getByRole('region', { name })

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('Noticias', () => {
  it('muestra Uruguay e Internacional con fuente, ubicación y enlace seguro al original', async () => {
    mockNews((p) => json(p.get('section') === 'uy'
      ? page('uy', [item('a'), item('b', { department: 'Salto', city: 'Salto', source: { name: 'Diario Cambio', url: null } })])
      : page('intl', [item('c', { country: 'AR', countryName: 'Argentina', department: null, source: { name: 'Página/12', url: null } })])))
    renderPage()

    const uy = await screen.findByRole('region', { name: 'Uruguay' })
    const link = await within(uy).findByRole('link', { name: /Noticia a/ })
    expect(link).toHaveAttribute('href', 'https://medio.example/a')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(uy).getAllByText('la diaria').length).toBeGreaterThan(0)
    expect(within(uy).getByText('Salto')).toBeInTheDocument()
    const intl = section('Internacional')
    expect(await within(intl).findByText('Noticia c')).toBeInTheDocument()
    expect(within(intl).getByText('Argentina')).toBeInTheDocument()
    // Cuenta regresiva o "En breve…", según la hora en que corra el test.
    expect(screen.getByText(/buscaremos nuevas noticias/i)).toBeInTheDocument()
  })

  it('muestra cuánto falta para la próxima búsqueda de noticias', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2026-10-19T12:15:00.000Z') })
    mockNews((p) => json(page(p.get('section'), [item(`${p.get('section')}-1`)])))
    renderPage()
    // El servidor informa la próxima búsqueda a las 13:00 UTC.
    expect(await screen.findByText('45 min')).toBeInTheDocument()
    expect(screen.getByText(/Buscaremos nuevas noticias para ti en/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('usa la portada de marca cuando la noticia no trae imagen o la imagen falla', async () => {
    mockNews((p) => json(page(p.get('section'), p.get('section') === 'uy' ? [item('a', { image: 'https://cdn.example/x.jpg' }), item('b')] : [])))
    const { container } = render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <NewsPage /> }])} />)
    await screen.findByText('Noticia a')
    const img = container.querySelector('img[src="https://cdn.example/x.jpg"]')
    expect(img).toHaveAttribute('referrerpolicy', 'no-referrer')
    img.dispatchEvent(new Event('error'))
    await waitFor(() => expect(container.querySelector('img[src="https://cdn.example/x.jpg"]')).toBeNull())
  })

  it('"Cargar más" agrega la página siguiente sin repetir noticias', async () => {
    const calls = mockNews((p) => {
      if (p.get('section') === 'intl') return json(page('intl', []))
      return p.get('page') === '1'
        ? json(page('uy', [item('a'), item('b')], { hasMore: true, total: 3, pageCount: 2 }))
        : json(page('uy', [item('b'), item('c')], { page: 2, total: 3, pageCount: 2 }))
    })
    renderPage()
    const uy = await screen.findByRole('region', { name: 'Uruguay' })
    await userEvent.click(await within(uy).findByRole('button', { name: 'Cargar más' }))
    expect(await within(uy).findByText('Noticia c')).toBeInTheDocument()
    expect(within(uy).getAllByRole('article')).toHaveLength(3)
    expect(within(uy).queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
    expect(calls.some((p) => p.get('section') === 'uy' && p.get('page') === '2')).toBe(true)
  })

  it('los filtros de cada sección viajan en la URL y se envían al servidor', async () => {
    const calls = mockNews((p) => json(page(p.get('section'), [item(`${p.get('section')}-1`)])))
    const router = renderPage()
    const uy = await screen.findByRole('region', { name: 'Uruguay' })
    await userEvent.selectOptions(await within(uy).findByLabelText('Ubicación'), 'interior')
    await waitFor(() => expect(calls.some((p) => p.get('section') === 'uy' && p.get('location') === 'interior')).toBe(true))
    expect(router.state.location.search).toBe('?lugar=interior')
    expect(calls.filter((p) => p.get('section') === 'intl').every((p) => !p.get('location'))).toBe(true)
  })

  it('en desarrollo, explica cómo levantar el servicio si no está corriendo', async () => {
    mockNews(() => Promise.resolve(new Response(null, { status: 500, headers: { 'Content-Type': 'text/plain' } })))
    renderPage()
    const uy = await screen.findByRole('region', { name: 'Uruguay' })
    expect(await within(uy).findByText(/El servicio de noticias no está corriendo/)).toBeInTheDocument()
  })

  it('distingue la sección vacía, el filtro sin resultados y el error con reintento', async () => {
    let fail = true
    mockNews((p) => {
      if (p.get('section') === 'intl') return fail ? json({ error: 'internal' }, 500) : json(page('intl', [item('c')]))
      return json(page('uy', [], { facets: { disciplines: [], locations: [] } }))
    })
    renderPage('/noticias?disciplina=danza')
    const uy = await screen.findByRole('region', { name: 'Uruguay' })
    expect(await within(uy).findByText('No hay noticias con esos filtros')).toBeInTheDocument()
    const intl = section('Internacional')
    expect(await within(intl).findByText('Las noticias no están disponibles en este momento.')).toBeInTheDocument()
    fail = false
    await userEvent.click(within(intl).getByRole('button', { name: 'Reintentar' }))
    expect(await within(intl).findByText('Noticia c')).toBeInTheDocument()
  })
})
