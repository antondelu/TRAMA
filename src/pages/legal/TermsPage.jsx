import { LegalPage } from './LegalPage'

const SECTIONS = [
  { title: 'Qué es TRAMA', body: ['Una plataforma que conecta salas, espectáculos, profesionales y recursos de las artes escénicas. TRAMA no es parte de los acuerdos entre usuarios: facilita el contacto.'] },
  { title: 'Publicaciones', body: ['Lo que publicás tiene que ser verdadero y tuyo, o tenés que tener permiso para publicarlo. Las publicaciones pasan por moderación y pueden rechazarse si no cumplen estas condiciones.'] },
  { title: 'Solicitudes y acuerdos', body: ['Una solicitud de reserva o de contratación no es un contrato. Las condiciones finales las acuerdan las partes.'] },
  { title: 'Derechos de autor', body: ['No se permite subir obras protegidas sin autorización. La biblioteca de Recursos ofrece contenidos propios, autorizados o referencias.'] },
  { title: 'Membresías', body: ['Las membresías pagas dan acceso a contenidos exclusivos. En la versión de demostración no se realizan cobros.'] },
]

export default function TermsPage() {
  return <LegalPage title="Términos y condiciones" updated="19 de octubre de 2026" sections={SECTIONS} />
}
