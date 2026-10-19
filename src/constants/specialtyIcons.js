import {
  Camera, Video, Lightbulb, Speaker, SlidersHorizontal, Brush, VenetianMask, Shirt, Hammer, Crown, PenTool, Newspaper,
  Megaphone, ClipboardList, Clapperboard, Feather, Languages, Captions, Film, Boxes, Truck, GraduationCap,
} from 'lucide-react'

// Ícono de cada especialidad de servicios (ver TAXONOMIES.specialties). Se usa
// en la portada cuando el perfil no tiene foto. Las especialidades que se
// agreguen desde /admin/configuracion y no estén acá usan el ícono genérico.
export const SPECIALTY_ICONS = {
  fotografia: Camera, video: Video, iluminacion: Lightbulb, sonido: Speaker, 'operacion-tecnica': SlidersHorizontal,
  maquillaje: Brush, caracterizacion: VenetianMask, vestuario: Shirt, escenografia: Hammer, utileria: Crown,
  'diseno-grafico': PenTool, prensa: Newspaper, marketing: Megaphone, produccion: ClipboardList,
  'asistencia-direccion': Clapperboard, dramaturgia: Feather, traduccion: Languages, subtitulado: Captions,
  registro: Film, 'alquiler-equipos': Boxes, transporte: Truck, 'clases-talleres': GraduationCap,
}

// La primera especialidad elegida decide el ícono.
export const specialtyIcon = (specialties = []) => SPECIALTY_ICONS[specialties[0]]
