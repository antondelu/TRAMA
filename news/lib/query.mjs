// Read side of the API: filters, orders and pages the stored items for one
// section, and lists the filter options that section actually has.
import { DISCIPLINES } from "./classify.mjs"
import { COUNTRIES } from "./geo.mjs"

const PAGE_SIZE = { uy: 9, intl: 6 }
const MAX_PAGE_SIZE = 30
const DISCIPLINE_LABELS = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d.label]))

// Location filter values: "montevideo" / "interior" / a department for
// Uruguay; "latam" / "world" / a country code for the international block.
function matchesLocation(item, location) {
  if (!location) return true
  if (item.section === "uy") return location === item.area || location === item.department
  return location === item.area || location === item.country
}

function publicItem(item, sourcesById) {
  const source = sourcesById[item.sourceId]
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    url: item.url,
    image: item.image,
    publishedAt: item.publishedAt,
    source: { name: source?.name ?? item.sourceId, url: source?.homepage ?? null },
    country: item.country,
    countryName: COUNTRIES[item.country]?.name ?? null,
    department: item.department,
    city: item.city,
    disciplines: item.disciplines.map((id) => ({ id, label: DISCIPLINE_LABELS[id] ?? id })),
  }
}

function countBy(items, key) {
  const counts = new Map()
  for (const it of items) for (const k of [].concat(key(it)).filter(Boolean)) counts.set(k, (counts.get(k) ?? 0) + 1)
  return counts
}

function facets(items, section) {
  const disciplines = [...countBy(items, (it) => it.disciplines)]
    .map(([id, count]) => ({ id, label: DISCIPLINE_LABELS[id] ?? id, count }))
    .sort((a, b) => b.count - a.count)
  const locations = section === "uy"
    ? [
        ...[...countBy(items, (it) => it.area)].map(([id, count]) => ({ id, label: id === "montevideo" ? "Montevideo" : "Interior", count, group: "area" })),
        ...[...countBy(items, (it) => (it.area === "interior" ? it.department : null))]
          .map(([id, count]) => ({ id, label: id, count, group: "department" }))
          .sort((a, b) => a.label.localeCompare(b.label, "es")),
      ]
    : [
        ...[...countBy(items, (it) => it.area)].map(([id, count]) => ({ id, label: id === "latam" ? "Latinoamérica" : "Resto del mundo", count, group: "area" })),
        ...[...countBy(items, (it) => it.country)]
          .map(([id, count]) => ({ id, label: COUNTRIES[id]?.name ?? id, count, group: "country" }))
          .sort((a, b) => a.label.localeCompare(b.label, "es")),
      ]
  return { disciplines, locations }
}

// Latin America first in the international block: two Latin American items
// for each one from elsewhere, each region still newest first. Leftovers of
// either region follow in date order.
const LATAM_PER_WORLD = 2
export function prioritizeLatam(sorted) {
  const latam = sorted.filter((it) => it.area === "latam")
  const world = sorted.filter((it) => it.area !== "latam")
  const out = []
  while (latam.length || world.length) {
    out.push(...latam.splice(0, LATAM_PER_WORLD))
    out.push(...world.splice(0, 1))
  }
  return out
}

export function queryNews(data, sources, params) {
  const section = params.section === "intl" ? "intl" : "uy"
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(params.pageSize, 10) || PAGE_SIZE[section]))
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1)
  const sourcesById = Object.fromEntries(sources.map((s) => [s.id, s]))

  const inSection = data.items.filter((it) => it.section === section)
  const sorted = inSection
    .filter((it) => !params.discipline || it.disciplines.includes(params.discipline))
    .filter((it) => matchesLocation(it, params.location))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  const filtered = section === "intl" && !params.location ? prioritizeLatam(sorted) : sorted

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  return {
    section,
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map((it) => publicItem(it, sourcesById)),
    total,
    page,
    pageCount,
    hasMore: page < pageCount,
    facets: facets(inSection, section),
    lastSuccessAt: data.lastSuccessAt,
    lastRunAt: data.lastRunAt,
  }
}

// Operational status: when the last runs happened and how each source is doing.
export function newsStatus(data, sources) {
  return {
    lastRunAt: data.lastRunAt,
    lastSuccessAt: data.lastSuccessAt,
    items: data.items.length,
    lastRun: data.runs[0] ?? null,
    sources: sources.map((s) => ({
      id: s.id,
      outlet: s.outlet ?? s.id,
      name: s.name,
      enabled: s.enabled !== false,
      lastAttemptAt: data.sources[s.id]?.lastAttemptAt ?? null,
      lastSuccessAt: data.sources[s.id]?.lastSuccessAt ?? null,
      lastError: data.sources[s.id]?.lastError ?? null,
      consecutiveFailures: data.sources[s.id]?.consecutiveFailures ?? 0,
    })),
  }
}
