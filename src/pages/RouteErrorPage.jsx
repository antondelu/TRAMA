import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Stage } from '@/components/media/Stage'
import { HamletScene } from '@/components/media/HamletScene'

// Se muestra si una página falla al cargar o al renderizar.
// No usa el resto del layout, por si el error viene de ahí.
export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (import.meta.env.DEV) console.error(error)
  return (
    <Stage as="main" follow={false} style={{ '--sy': '30%' }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <p className="enter font-display text-2xl font-semibold tracking-[0.18em]" style={{ '--d': '700ms' }}>TRAMA</p>
      <HamletScene className="mt-6 w-52 sm:w-60" />
      {!notFound && (
        <blockquote className="enter mt-6 font-display text-xl italic text-white/75 sm:text-2xl" style={{ '--d': '1200ms' }}>
          «Algo huele a podrido en Dinamarca.»
        </blockquote>
      )}
      <h1 className="enter mt-8 max-w-xl font-display text-4xl font-semibold" style={{ '--d': '2500ms' }}>
        {notFound ? <>Esta página eligió <span className="stage-lit">no ser.</span></> : 'Algo salió mal'}
      </h1>
      <p className="enter mt-3 max-w-xl text-white/65" style={{ '--d': '2650ms' }}>
        {notFound ? 'La dirección no existe.' : 'Tuvimos un problema al mostrar esta página. Probá recargar; si sigue pasando, avisanos.'}
      </p>
      <div className="enter mt-6 flex gap-2" style={{ '--d': '2800ms' }}>
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-lg bg-white px-4 text-sm font-semibold text-brand hover:bg-[rgb(255_241_214)]">Recargar</button>
        <Link to="/" className="inline-flex min-h-11 items-center rounded-lg border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10">Ir al inicio</Link>
      </div>
    </Stage>
  )
}
