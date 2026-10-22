import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/format'

// Rectángulos planos: tinta llena para la acción principal, contorno de 2 px
// para la secundaria. Sin sombras ni esquinas redondeadas (ver tokens en index.css).
const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  accent: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'bg-surface text-ink border-2 border-ink hover:bg-ink hover:text-white',
  ghost: 'text-ink underline-offset-4 hover:bg-ink/5 hover:underline',
  danger: 'bg-danger text-white hover:brightness-90',
  // Sobre fondos oscuros (hero, cierre, 404). Variantes propias en lugar de pisar
  // clases: si no, el hover del primario (azul noche) gana y el botón desaparece.
  inverse: 'bg-white text-brand hover:bg-[#FFE7B3]',
  'inverse-outline': 'border-2 border-white text-white hover:bg-white hover:text-brand',
  link: 'text-ink font-bold underline decoration-2 underline-offset-4 hover:decoration-4 px-0 min-h-0',
}

const SIZES = {
  sm: 'min-h-10 px-3.5 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-14 px-6 text-lg gap-2.5',
  icon: 'size-11 justify-center',
}

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center font-bold transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55',
    VARIANTS[variant], variant !== 'link' && SIZES[size], className,
  )
}

// Botón o enlace con el mismo aspecto. Con `to` es un Link interno; con
// `href` un enlace externo. `loading` deshabilita y evita envíos dobles.
export const Button = forwardRef(function Button(
  { variant, size, className, to, href, loading = false, disabled, icon: Icon, iconRight: IconRight, children, type = 'button', ...props },
  ref,
) {
  const classes = buttonClasses({ variant, size, className })
  const content = (
    <>
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : Icon && <Icon aria-hidden className="size-4 shrink-0" />}
      {children}
      {IconRight && <IconRight aria-hidden className="size-4 shrink-0" />}
    </>
  )
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
})
