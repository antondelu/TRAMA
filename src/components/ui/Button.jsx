import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/format'

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-strong shadow-sm',
  accent: 'bg-accent text-white hover:bg-accent-strong shadow-sm',
  secondary: 'bg-surface text-ink border border-line-strong hover:border-ink hover:bg-canvas',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:brightness-90',
  link: 'text-brand underline-offset-4 hover:underline px-0 min-h-0',
}

const SIZES = {
  sm: 'min-h-9 px-3 text-sm gap-1.5',
  md: 'min-h-11 px-4 text-sm gap-2',
  lg: 'min-h-12 px-6 text-base gap-2',
  icon: 'size-11 justify-center',
}

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150',
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
