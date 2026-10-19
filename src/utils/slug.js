export function slugify(text = '') {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Devuelve un slug que no choque con los existentes (sala, sala-2, sala-3...).
export function uniqueSlug(base, taken) {
  const root = slugify(base) || 'publicacion'
  let slug = root
  let n = 2
  while (taken.has(slug)) slug = `${root}-${n++}`
  return slug
}
