// Catálogos iniciales. Son la semilla: en la app se leen a través de
// configService, y desde /admin/configuracion se pueden agregar valores nuevos.
// Cada valor tiene un id estable (no cambia aunque cambie la etiqueta).

export const COUNTRIES = [
  {
    code: 'UY',
    name: 'Uruguay',
    currency: 'UYU',
    timezone: 'America/Montevideo',
    departments: [
      'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
      'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera', 'Rocha',
      'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
    ],
    cities: [
      { name: 'Montevideo', department: 'Montevideo' },
      { name: 'Ciudad de la Costa', department: 'Canelones' },
      { name: 'Las Piedras', department: 'Canelones' },
      { name: 'Maldonado', department: 'Maldonado' },
      { name: 'Punta del Este', department: 'Maldonado' },
      { name: 'Colonia del Sacramento', department: 'Colonia' },
      { name: 'Salto', department: 'Salto' },
      { name: 'Paysandú', department: 'Paysandú' },
      { name: 'Rivera', department: 'Rivera' },
      { name: 'Tacuarembó', department: 'Tacuarembó' },
      { name: 'Mercedes', department: 'Soriano' },
      { name: 'Rocha', department: 'Rocha' },
    ],
  },
]

const t = (pairs) => pairs.map(([id, label]) => ({ id, label }))

export const TAXONOMIES = {
  venueTypes: t([
    ['sala-italiana', 'Sala a la italiana'], ['caja-negra', 'Caja negra'], ['sala-polivalente', 'Sala polivalente'],
    ['espacio-no-convencional', 'Espacio no convencional'], ['aire-libre', 'Espacio al aire libre'], ['sala-ensayo', 'Sala de ensayo'],
  ]),
  equipment: t([
    ['parrilla-luces', 'Parrilla de luces'], ['consola-luces', 'Consola de iluminación'], ['moviles', 'Luces móviles'],
    ['sonido-pa', 'Sistema de sonido (PA)'], ['monitores', 'Monitores de escenario'], ['microfonia', 'Microfonía'],
    ['proyector', 'Proyector'], ['piso-danza', 'Piso de danza'], ['telon', 'Telón de boca'], ['patas-bambalinas', 'Patas y bambalinas'],
  ]),
  accessibility: t([
    ['acceso-silla', 'Acceso en silla de ruedas'], ['bano-accesible', 'Baño accesible'], ['rampa-escenario', 'Rampa a escenario'],
    ['bucle-magnetico', 'Bucle magnético'], ['lugares-reservados', 'Lugares reservados'],
  ]),
  rentalModes: t([
    ['por-funcion', 'Por función'], ['por-dia', 'Por día'], ['por-hora', 'Por hora'], ['temporada', 'Por temporada'],
    ['bordero', 'Borderó'], ['ensayos', 'Para ensayos'],
  ]),
  disciplines: t([
    ['teatro', 'Teatro'], ['danza', 'Danza'], ['circo', 'Circo'], ['titeres', 'Títeres'], ['performance', 'Performance'],
    ['teatro-musical', 'Teatro musical'], ['interdisciplinarias', 'Artes escénicas interdisciplinarias'],
  ]),
  genres: t([
    ['drama', 'Drama'], ['comedia', 'Comedia'], ['tragicomedia', 'Tragicomedia'], ['documental', 'Teatro documental'],
    ['objetos', 'Teatro de objetos'], ['contemporanea', 'Danza contemporánea'], ['clown', 'Clown'], ['infantil', 'Infantil y familiar'],
  ]),
  audiences: t([
    ['adultos', 'Adultos'], ['jovenes', 'Jóvenes'], ['familias', 'Familias'], ['infancias', 'Infancias'], ['todo-publico', 'Todo público'],
  ]),
  technicalNeeds: t([['minimas', 'Mínimas'], ['medias', 'Medias'], ['altas', 'Altas']]),
  stagingFormats: t([
    ['sala-convencional', 'Sala convencional'], ['espacio-no-convencional', 'Espacio no convencional'],
    ['calle', 'Calle y espacio público'], ['itinerante', 'Itinerante'],
  ]),
  bookingModes: t([
    ['por-funcion', 'Por función'], ['temporada', 'Temporada'], ['bordero', 'Borderó'], ['cache-fijo', 'Caché fijo'],
    ['coproduccion', 'Coproducción'],
  ]),
  specialties: t([
    ['fotografia', 'Fotografía'], ['video', 'Video y realización audiovisual'], ['iluminacion', 'Iluminación'], ['sonido', 'Sonido'],
    ['operacion-tecnica', 'Operación técnica'], ['maquillaje', 'Maquillaje'], ['caracterizacion', 'Caracterización'],
    ['vestuario', 'Vestuario'], ['escenografia', 'Escenografía'], ['utileria', 'Utilería'], ['diseno-grafico', 'Diseño gráfico'],
    ['prensa', 'Comunicación y prensa'], ['marketing', 'Marketing cultural'], ['produccion', 'Producción'],
    ['asistencia-direccion', 'Asistencia de dirección'], ['dramaturgia', 'Dramaturgia'], ['traduccion', 'Traducción'],
    ['subtitulado', 'Subtitulado'], ['registro', 'Registro audiovisual'], ['alquiler-equipos', 'Alquiler de equipamiento'],
    ['transporte', 'Transporte y logística'],
  ]),
  providerTypes: t([['persona', 'Profesional independiente'], ['empresa', 'Empresa'], ['cooperativa', 'Cooperativa o colectivo']]),
  workModes: t([['presencial', 'Presencial'], ['remota', 'Remota']]),
  serviceAvailability: t([['disponible', 'Disponible'], ['agenda-limitada', 'Agenda limitada'], ['sin-disponibilidad', 'Sin disponibilidad']]),
  experienceLevels: t([['inicial', 'Hasta 3 años'], ['media', '3 a 10 años'], ['senior', 'Más de 10 años']]),
  opportunityTypes: t([
    ['programacion', 'Convocatoria para programar espectáculos'], ['temporada', 'Búsqueda de obras para temporada'],
    ['festival', 'Convocatoria para festivales'], ['residencia', 'Residencia artística'], ['coproduccion', 'Coproducción'],
    ['proyectos', 'Invitación a presentar proyectos'], ['seleccion', 'Selección artística'],
    ['profesionales', 'Búsqueda de profesionales'], ['colaboracion', 'Oportunidad de colaboración'],
  ]),
  organizationTypes: t([
    ['sala', 'Sala'], ['festival', 'Festival'], ['institucion', 'Institución'], ['compania', 'Compañía'], ['programador', 'Programador'],
  ]),
  compensation: t([
    ['remunerada', 'Remunerada'], ['bordero', 'Borderó o porcentaje'], ['apoyo', 'Apoyo en especie'], ['sin-remuneracion', 'Sin remuneración'],
  ]),
  resourceTypes: t([
    ['video', 'Video'], ['audio', 'Audio'], ['article', 'Artículo'], ['pdf', 'PDF'], ['book', 'Libro o referencia'],
    ['course', 'Curso'], ['template', 'Plantilla'],
  ]),
  resourceCategories: t([
    ['charlas', 'Charlas y entrevistas'], ['podcasts', 'Podcasts'], ['lecturas', 'Libros y lecturas recomendadas'],
    ['articulos', 'Artículos'], ['guias', 'Guías prácticas'], ['plantillas', 'Plantillas descargables'],
    ['cursos', 'Cursos y talleres'], ['clases', 'Clases grabadas'], ['casos', 'Estudios de caso'],
    ['produccion', 'Herramientas de producción'], ['gestion', 'Recursos de gestión cultural'],
    ['convocatorias-comentadas', 'Convocatorias comentadas'], ['tecnico', 'Material técnico'],
    ['financiacion', 'Financiación y patrocinio'],
  ]),
  activityTypes: t([
    ['funcion', 'Función de espectáculo'], ['ensayo', 'Ensayo'], ['taller', 'Taller o clase'], ['muestra', 'Muestra o presentación'],
    ['grabacion', 'Grabación o registro'], ['otro', 'Otro'],
  ]),
  timeSlots: t([['manana', 'Mañana (9 a 13 h)'], ['tarde', 'Tarde (14 a 18 h)'], ['noche', 'Noche (19 a 23 h)'], ['dia-completo', 'Día completo']]),
  interests: t([['salas', 'Salas'], ['espectaculos', 'Espectáculos'], ['servicios', 'Servicios'], ['recursos', 'Recursos']]),
}

export function labelOf(list, id) {
  return list?.find((item) => item.id === id)?.label ?? id
}
