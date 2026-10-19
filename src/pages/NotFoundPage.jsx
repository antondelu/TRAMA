import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { SearchBar } from '@/components/navigation/SearchBar'
import { Stage } from '@/components/media/Stage'
import { HamletScene } from '@/components/media/HamletScene'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// El mismo escenario del inicio, con el foco fijo sobre Hamlet: duda,
// cae de rodillas y recién entonces aparece el mensaje.
export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <Stage follow={false} className="stage-blend" aria-labelledby="not-found-title" style={{ '--sy': '30%' }}>
      <PageContainer narrow className="relative flex min-h-[44rem] flex-col items-center justify-center py-16 text-center">
        <p className="enter text-xs font-semibold uppercase tracking-[0.3em] text-white/50" style={{ '--d': '700ms' }}>Error 404</p>
        <HamletScene className="mt-6 w-56 sm:w-64" />
        <h1 id="not-found-title" className="enter mt-8 font-display text-4xl font-bold tracking-tight sm:text-6xl" style={{ '--d': '2500ms' }}>
          Esta página eligió <span className="stage-lit">no ser.</span>
        </h1>
        <p className="enter mt-4 text-lg text-white/65" style={{ '--d': '2650ms' }}>La página que buscás no existe o cambió de dirección.</p>
        <div className="enter mt-8 w-full max-w-2xl" style={{ '--d': '2800ms' }}>
          <SearchBar className="border-white/10 shadow-[0_20px_60px_-20px_rgb(0_0_0_/_0.6)]" />
        </div>
        <div className="enter mt-8 flex flex-wrap justify-center gap-3" style={{ '--d': '2950ms' }}>
          <Button to="/" className="bg-white !text-brand shadow-none hover:bg-[rgb(255_241_214)]">Ir al inicio</Button>
          <Button variant="ghost" to="/contacto" className="text-white hover:bg-white/10">Avisarnos</Button>
        </div>
      </PageContainer>
    </Stage>
  )
}
