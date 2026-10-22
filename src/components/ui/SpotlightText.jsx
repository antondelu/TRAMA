// Frase con las últimas palabras destacadas: condensadas y subrayadas con un
// trazo grueso del color de Servicios. Antes era un foco de luz que barría
// la frase; ahora es tipografía, sin animación.
export function SpotlightText({ before, lit }) {
  return (
    <>
      {before}{' '}
      <span className="whitespace-nowrap underline decoration-area-servicios decoration-[0.14em] underline-offset-[0.12em] [font-stretch:72%]">{lit}</span>
    </>
  )
}
