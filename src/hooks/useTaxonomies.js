import { useEffect, useState } from 'react'
import { configService, subscribeToData } from '@/services'
import { labelOf } from '@/constants/taxonomies'

// Catálogos configurables + ayuda para traducir ids a etiquetas.
export function useTaxonomies() {
  const [tax, setTax] = useState(() => configService.taxonomies())
  useEffect(() => subscribeToData(() => setTax({ ...configService.taxonomies() })), [])
  return {
    tax,
    label: (key, id) => labelOf(tax[key], id),
    labels: (key, ids = []) => ids.map((id) => labelOf(tax[key], id)),
  }
}
