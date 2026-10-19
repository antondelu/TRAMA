import { zodResolver } from '@hookform/resolvers/zod'

// Zod no corre las validaciones entre campos (.refine del objeto) mientras
// haya otros errores, así que "las contraseñas no coinciden" aparecería recién
// al final. Este resolver corre esas comprobaciones siempre, junto al resto.
// checks: [(values) => ({ path, message }) | null]
export function resolverWithChecks(schema, checks) {
  const base = zodResolver(schema)
  return async (values, context, options) => {
    const result = await base(values, context, options)
    const extra = {}
    for (const check of checks) {
      const issue = check(values)
      if (issue && !result.errors?.[issue.path]) extra[issue.path] = { type: 'custom', message: issue.message }
    }
    if (!Object.keys(extra).length) return result
    return { values: {}, errors: { ...result.errors, ...extra } }
  }
}
