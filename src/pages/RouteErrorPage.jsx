import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

// Se muestra si una página falla al cargar o al renderizar.
// No usa el resto del layout, por si el error viene de ahí.
export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (import.meta.env.DEV) console.error(error)
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-2xl font-semibold tracking-[0.18em]">TRAMA</p>
      <h1 className="mt-6 font-serif text-4xl font-semibold">{notFound ? 'Página no encontrada' : 'Algo salió mal'}</h1>
      <p className="mt-3 text-ink-soft">
        {notFound ? 'La dirección no existe.' : 'Tuvimos un problema al mostrar esta página. Probá recargar; si sigue pasando, avisanos.'}
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-white">Recargar</button>
        <Link to="/" className="inline-flex min-h-11 items-center rounded-lg border border-line-strong px-4 text-sm font-semibold">Ir al inicio</Link>
      </div>
    </main>
  )
}
