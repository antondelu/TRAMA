import { HeroSection } from './HeroSection'
import { CategoryCards } from './CategoryCards'
import { FeaturedTabs } from './FeaturedTabs'
import { JoinSection } from './JoinSection'
import { SponsorStrip } from './SponsorStrip'
import { TonightSection } from './TonightSection'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// Home minimalista: hero, áreas, invitación a publicar, sponsors, cartelera en
// el mapa y destacados. Las convocatorias tienen su acceso en el menú principal
// y en el cierre.
export default function HomePage() {
  useDocumentTitle(null)
  return (
    <>
      <HeroSection />
      <section aria-labelledby="categories-title" className="py-14 sm:py-20">
        <PageContainer>
          <Reveal className="mb-8 max-w-3xl">
            <h2 id="categories-title" className="font-display text-4xl font-extrabold leading-[0.95] sm:text-6xl">Encontrá lo que tu proyecto necesita</h2>
          </Reveal>
          <CategoryCards />
        </PageContainer>
      </section>
      {/* La invitación a publicar llega después de ver las áreas; los sponsors,
          cuando ya se entiende qué es TRAMA. La cartelera muestra qué pasa hoy;
          Destacados cierra antes del pie. */}
      <JoinSection />
      <SponsorStrip />
      <TonightSection />
      <FeaturedTabs />
    </>
  )
}
