import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { SearchBar } from '@/components/navigation/SearchBar'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <PageContainer narrow className="py-20 text-center">
      <p className="eyebrow text-brand">Error 404</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Se cortó el hilo.</h1>
      <p className="mt-4 text-lg text-ink-soft">La página que buscás no existe o cambió de dirección.</p>
      <SearchBar className="mx-auto mt-8 max-w-2xl" />
      <div className="mt-8 flex justify-center gap-2">
        <Button to="/">Ir al inicio</Button>
        <Button variant="secondary" to="/contacto">Avisarnos</Button>
      </div>
    </PageContainer>
  )
}
