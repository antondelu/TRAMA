import { z } from 'zod'

// Listas como texto, una por línea (equipamiento, requisitos, elenco...).
export const toLines = (arr) => (arr ?? []).join('\n')
export const fromLines = (text) => String(text ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

export const emptyToNull = (v) => (v === '' || v == null ? null : v)

export const optionalNumber = z.union([z.literal(''), z.coerce.number({ invalid_type_error: 'Tiene que ser un número' }).min(0, 'No puede ser negativo')])
export const requiredNumber = (msg) => z.coerce.number({ invalid_type_error: msg }).min(1, msg)
export const slugField = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, 'Solo minúsculas, números y guiones (ej. sala-del-puerto)')
export const httpsUrl = z.union([z.literal(''), z.string().url('URL no válida').startsWith('https://', 'Tiene que empezar con https://')])
export const lines = z.string()
export const requiredLines = (msg) => z.string().refine((s) => fromLines(s).length > 0, msg)
