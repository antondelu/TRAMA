import { HeroSection } from './HeroSection'
import { CategoryCards } from './CategoryCards'
import { FeaturedTabs } from './FeaturedTabs'
import { JoinSection } from './JoinSection'
import { SponsorStrip } from './SponsorStrip'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// Home minimalista: cuatro bloques. Las oportunidades tienen su acceso en el
// menú principal y en el cierre.
export default function HomePage() {
  useDocumentTitle(null)
  return (
    <>
      <HeroSection />
      <SponsorStrip />
      <section aria-labelledby="categories-title" className="py-14 sm:py-20">
        <PageContainer>
          <Reveal className="mb-12">
            <h2 id="categories-title" className="text-center font-display text-3xl font-bold tracking-tight sm:text-left sm:text-5xl">Encontrá lo que tu proyecto necesita</h2>
          </Reveal>
          <CategoryCards />
        </PageContainer>
      </section>
      <FeaturedTabs />
      <JoinSection />
    </>
  )
}
