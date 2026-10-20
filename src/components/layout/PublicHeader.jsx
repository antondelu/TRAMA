import { useState } from 'react'
import { Menu, Search } from 'lucide-react'
import { Logo } from '@/components/navigation/Logo'
import { MainNavigation } from '@/components/navigation/MainNavigation'
import { MobileNavigation } from '@/components/navigation/MobileNavigation'
import { AccountMenu } from '@/components/navigation/AccountMenu'
import { Button } from '@/components/ui/Button'
import { PageContainer } from './PageContainer'
import { useAuth } from '@/context/AuthContext'

export function PublicHeader() {
  const { user, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <MainNavigation />
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" to="/buscar" aria-label="Buscar en TRAMA"><Search aria-hidden className="size-5" /></Button>
          {!loading && (user ? (
            <>
              <Button variant="secondary" size="sm" to="/publicar" className="hidden sm:inline-flex">Publicar</Button>
              <AccountMenu />
            </>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button variant="ghost" size="sm" to="/ingresar">Ingresar</Button>
              <Button size="sm" to="/registro">Registrarme</Button>
            </div>
          ))}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            <Menu aria-hidden className="size-5" />
          </Button>
        </div>
      </PageContainer>
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
