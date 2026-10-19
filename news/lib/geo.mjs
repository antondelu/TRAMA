// Geography used to place each news item: Uruguay's 19 departments with their
// main towns, and the countries shown in the international block.
import { fold } from "./text.mjs"

// Names that are also common words or surnames ("Salto", "Rivera", "Flores",
// "Artigas"...) only count after a preposition ("en Salto", "de Rivera"), and
// are always matched with their capital letter.
export const DEPARTMENTS = [
  { name: "Artigas", ambiguous: true, towns: ["Bella Unión", "Tomás Gomensoro", "Baltasar Brum"] },
  { name: "Canelones", towns: ["Ciudad de la Costa", "Las Piedras", "Pando", "La Paz", "Progreso", "Santa Lucía", "Atlántida", "Parque del Plata", "Sauce", "Tala", "San Ramón", "Barros Blancos", "Salinas", "Toledo"] },
  { name: "Cerro Largo", towns: ["Melo", "Río Branco", "Fraile Muerto"] },
  { name: "Colonia", ambiguous: true, towns: ["Colonia del Sacramento", "Carmelo", "Juan Lacaze", "Nueva Helvecia", "Rosario", "Nueva Palmira", "Tarariras", "Colonia Valdense"] },
  { name: "Durazno", ambiguous: true, towns: ["Sarandí del Yí", "Villa del Carmen"] },
  { name: "Flores", ambiguous: true, towns: ["Trinidad", "Ismael Cortinas"] },
  { name: "Florida", ambiguous: true, towns: ["Sarandí Grande", "Casupá", "Fray Marcos"] },
  { name: "Lavalleja", towns: ["Minas", "José Pedro Varela", "Solís de Mataojo"] },
  { name: "Maldonado", towns: ["Punta del Este", "San Carlos", "Piriápolis", "Pan de Azúcar", "Aiguá", "José Ignacio"] },
  { name: "Montevideo", towns: [] },
  { name: "Paysandú", towns: ["Guichón", "Quebracho", "Nuevo Paysandú"] },
  { name: "Río Negro", towns: ["Fray Bentos", "Young", "Nuevo Berlín", "San Javier"] },
  { name: "Rivera", ambiguous: true, towns: ["Tranqueras", "Vichadero", "Minas de Corrales"] },
  { name: "Rocha", ambiguous: true, towns: ["Chuy", "Castillos", "Lascano", "La Paloma", "Cabo Polonio", "Punta del Diablo"] },
  { name: "Salto", ambiguous: true, towns: ["Constitución", "Belén", "Termas del Daymán"] },
  { name: "San José", towns: ["San José de Mayo", "Ciudad del Plata", "Libertad", "Ecilda Paullier"] },
  { name: "Soriano", towns: ["Mercedes", "Dolores", "Cardona", "Palmitas"] },
  { name: "Tacuarembó", towns: ["Paso de los Toros", "San Gregorio de Polanco", "Ansina"] },
  { name: "Treinta y Tres", towns: ["Vergara", "Santa Clara de Olimar"] },
]

// Town names that are also everyday words or names elsewhere.
const AMBIGUOUS_TOWNS = new Set(["Rosario", "Libertad", "Mercedes", "Young", "Minas", "Constitución", "Belén", "Progreso", "La Paz", "Trinidad", "Dolores", "Toledo", "Salinas", "Tala", "Sauce", "Cardona", "Palmitas", "Vergara", "Ansina"])

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const PREP = "(?:en|de|desde|hacia|por|a)\\s+(?:la\\s+ciudad\\s+de\\s+|el\\s+departamento\\s+de\\s+)?"

const PLACES = DEPARTMENTS.flatMap((d) => [
  { label: d.name, department: d.name, city: null, ambiguous: Boolean(d.ambiguous) },
  ...d.towns.map((t) => ({ label: t, department: d.name, city: t, ambiguous: AMBIGUOUS_TOWNS.has(t) })),
])
  // Longest names first, so "Colonia del Sacramento" wins over "Colonia".
  .sort((a, b) => b.label.length - a.label.length)
  .map((p) => ({
    ...p,
    re: new RegExp(`${p.ambiguous ? `(?<![\\p{L}])${PREP}` : "(?<![\\p{L}])"}(${escape(p.label)})(?![\\p{L}])`, "u"),
  }))

// "Artigas" next to "José" / "Gervasio" / "Plaza" / "Avenida" is the hero or a street.
const NOT_PLACE = /(Jos[eé]|Gervasio|Plaza|Avenida|Av\.|Bulevar|Calle|Liceo|Escuela)\s+(de\s+)?$/

// First Uruguayan place mentioned in the text (title before summary), or null.
export function findUruguayPlace(text) {
  let best = null
  for (const p of PLACES) {
    const m = p.re.exec(text)
    if (!m) continue
    const at = m.index + m[0].length - m[1].length
    if (NOT_PLACE.test(text.slice(Math.max(0, at - 20), at))) continue
    if (!best || at < best.at) best = { at, department: p.department, city: p.city, ambiguous: p.ambiguous }
  }
  return best && { department: best.department, city: best.city, ambiguous: best.ambiguous }
}

export const NAMES_URUGUAY = /(?<![\p{L}])(Uruguay|Montevideo)(?![\p{L}])/u

export const COUNTRIES = {
  UY: { name: "Uruguay", region: "uy" },
  AR: { name: "Argentina", region: "latam" }, BR: { name: "Brasil", region: "latam" }, CL: { name: "Chile", region: "latam" },
  PY: { name: "Paraguay", region: "latam" }, BO: { name: "Bolivia", region: "latam" }, PE: { name: "Perú", region: "latam" },
  EC: { name: "Ecuador", region: "latam" }, CO: { name: "Colombia", region: "latam" }, VE: { name: "Venezuela", region: "latam" },
  MX: { name: "México", region: "latam" }, CU: { name: "Cuba", region: "latam" }, CR: { name: "Costa Rica", region: "latam" },
  PA: { name: "Panamá", region: "latam" }, DO: { name: "República Dominicana", region: "latam" }, GT: { name: "Guatemala", region: "latam" },
  PR: { name: "Puerto Rico", region: "latam" },
  ES: { name: "España", region: "world" }, PT: { name: "Portugal", region: "world" }, FR: { name: "Francia", region: "world" },
  IT: { name: "Italia", region: "world" }, DE: { name: "Alemania", region: "world" }, GB: { name: "Reino Unido", region: "world" },
  US: { name: "Estados Unidos", region: "world" }, CA: { name: "Canadá", region: "world" },
}

export const isMontevideo = (department) => department && fold(department) === "montevideo"
