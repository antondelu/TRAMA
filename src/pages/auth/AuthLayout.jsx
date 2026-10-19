import { PageContainer } from '@/components/layout/PageContainer'

export function AuthLayout({ title, description, children, aside }) {
  return (
    <PageContainer className="grid gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_24rem]">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-ink-soft">{description}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {aside && <aside className="lg:pt-16">{aside}</aside>}
    </PageContainer>
  )
}

// Destino seguro después de ingresar: solo rutas internas.
export function safeReturnPath(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/mi-cuenta'
}
