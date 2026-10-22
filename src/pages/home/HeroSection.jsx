import { PageContainer } from '@/components/layout/PageContainer'
import { SearchBar } from '@/components/navigation/SearchBar'

// Hero oscuro en azul noche: el título centrado y el buscador grande. Ver
// salas y publicar están en los bloques de áreas y en la invitación de abajo.
// Sin reflector ni escenario: el carácter lo dan la tipografía (ancha arriba,
// condensada en "hacer teatro.") y el contraste.
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title"
      className="bg-brand-strong bg-[radial-gradient(120%_80%_at_50%_0%,#2C4562_0%,transparent_60%)] text-white">
      <PageContainer className="flex min-h-[30rem] flex-col items-center justify-center py-16 text-center sm:min-h-[36rem] sm:py-20">
        <p className="eyebrow enter !text-white/65">Mercado profesional de las artes escénicas</p>
        <h1 id="hero-title" className="enter mt-5 max-w-5xl font-display text-[clamp(2.6rem,7vw,6rem)] font-extrabold leading-[0.92] [font-stretch:115%]" style={{ '--d': '60ms' }}>
          Todo lo que necesitás para <span className="block text-[#FFE7B3] [font-stretch:72%] [word-spacing:0.1em]">hacer teatro.</span>
        </h1>
        <p className="enter mt-6 max-w-xl text-lg text-white/80 sm:text-xl" style={{ '--d': '120ms' }}>
          Encontrá espacios, descubrí espectáculos, conectá con profesionales y accedé a recursos para tus proyectos.
        </p>
        <div className="enter mt-9 w-full max-w-2xl text-left" style={{ '--d': '180ms' }}>
          <SearchBar size="lg" className="border-white" />
        </div>
      </PageContainer>
    </section>
  )
}
