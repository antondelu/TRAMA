// Frase con foco seguidor: arranca tenue, un círculo de luz cálida la recorre
// y se queda sobre `lit`, que termina iluminado. Pasa una sola vez al cargar.
// Con "reducir movimiento" se muestra directamente el estado final.
export function SpotlightText({ before, lit }) {
  return (
    <>
      <span className="spot-dim">{before}</span>{' '}
      <span className="spot-lit">
        <span aria-hidden className="spot-beam" />
        {lit}
      </span>
    </>
  )
}
