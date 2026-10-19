import { cn, initials } from '@/utils/format'

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-lg', xl: 'size-24 text-2xl' }

// `focus` (ver utils/image.js) elige qué parte de la foto queda en el círculo.
export function Avatar({ name, src, focus, size = 'md', className }) {
  if (src) {
    return <img src={src} alt={name ? `Foto de ${name}` : ''} style={focus ? { objectPosition: `${focus.x}% ${focus.y}%` } : undefined} className={cn('rounded-full object-cover', SIZES[size], className)} />
  }
  return (
    <span aria-hidden={!name} title={name}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent', SIZES[size], className)}>
      {initials(name) || '·'}
    </span>
  )
}
