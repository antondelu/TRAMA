import { LegalPage } from './LegalPage'
import { APP } from '@/config/app'

const SECTIONS = [
  { title: 'Responsable', body: [`El responsable del sitio y de la base de datos de ${APP.name} es ${APP.owner}. Para cualquier consulta sobre tus datos, escribinos desde Contacto.`] },
  { title: 'Qué datos guardamos', body: ['Los datos de tu cuenta (nombre, correo, país, ciudad e intereses), lo que publicás y las solicitudes y mensajes que enviás dentro de TRAMA.'] },
  { title: 'Qué es público', body: ['Tu nombre, biografía, ciudad y especialidades, si tu perfil es público. Tu correo y teléfono solo se muestran si los marcás como públicos.'] },
  { title: 'Para qué los usamos', body: ['Para que la plataforma funcione: mostrar tus publicaciones, hacer llegar tus solicitudes y avisarte de novedades según tus preferencias.'] },
  { title: 'Tus derechos', body: ['Podés acceder, corregir o eliminar tus datos desde tu cuenta o escribiendo desde Contacto, conforme a la Ley N.º 18.331 de Protección de Datos Personales de Uruguay.'] },
  { title: 'Modo demostración', body: ['En esta versión los datos se guardan solo en tu navegador, en esta pestaña, y se borran al cerrarla. No se envían a ningún servidor salvo el formulario de Contacto.'] },
]

export default function PrivacyPage() {
  return <LegalPage title="Política de privacidad" updated="19 de octubre de 2026" sections={SECTIONS} />
}
