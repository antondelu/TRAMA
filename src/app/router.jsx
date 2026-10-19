import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import HomePage from '@/pages/home/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'

// Se muestra mientras se descarga la página inicial (si es de carga diferida).
function PageLoading() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center">
      <span className="font-serif text-2xl font-semibold tracking-[0.18em] text-ink-soft">TRAMA</span>
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

// Carga diferida: cada página se descarga cuando se visita.
const lazy = (load) => async () => ({ Component: (await load()).default })

// Ruta que exige sesión y, opcionalmente, un permiso.
const guarded = (load, permission) => ({
  element: <ProtectedRoute permission={permission} />,
  children: [{ index: true, lazy: lazy(load) }],
})

export const routes = [
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'buscar', lazy: lazy(() => import('@/pages/search/SearchPage')) },

      { path: 'salas', lazy: lazy(() => import('@/pages/venues/VenuesPage')) },
      { path: 'salas/:slug', lazy: lazy(() => import('@/pages/venues/VenueDetailPage')) },
      { path: 'espectaculos', lazy: lazy(() => import('@/pages/shows/ShowsPage')) },
      { path: 'espectaculos/:slug', lazy: lazy(() => import('@/pages/shows/ShowDetailPage')) },
      { path: 'servicios', lazy: lazy(() => import('@/pages/services/ServicesPage')) },
      { path: 'servicios/:slug', lazy: lazy(() => import('@/pages/services/ServiceDetailPage')) },
      { path: 'oportunidades', lazy: lazy(() => import('@/pages/opportunities/OpportunitiesPage')) },
      { path: 'oportunidades/:slug', lazy: lazy(() => import('@/pages/opportunities/OpportunityDetailPage')) },
      { path: 'recursos', lazy: lazy(() => import('@/pages/resources/ResourcesPage')) },
      { path: 'recursos/:slug', lazy: lazy(() => import('@/pages/resources/ResourceDetailPage')) },

      { path: 'planes', lazy: lazy(() => import('@/pages/info/PlansPage')) },
      { path: 'como-funciona', lazy: lazy(() => import('@/pages/info/HowItWorksPage')) },
      { path: 'nosotros', lazy: lazy(() => import('@/pages/info/AboutPage')) },
      { path: 'contacto', lazy: lazy(() => import('@/pages/info/ContactPage')) },
      { path: 'privacidad', lazy: lazy(() => import('@/pages/legal/PrivacyPage')) },
      { path: 'terminos', lazy: lazy(() => import('@/pages/legal/TermsPage')) },

      { path: 'ingresar', lazy: lazy(() => import('@/pages/auth/LoginPage')) },
      { path: 'registro', lazy: lazy(() => import('@/pages/auth/RegisterPage')) },
      { path: 'recuperar-contrasena', lazy: lazy(() => import('@/pages/auth/RecoverPasswordPage')) },

      {
        path: 'mi-cuenta',
        element: <ProtectedRoute />,
        children: [{
          lazy: lazy(() => import('@/pages/account/AccountLayout')),
          children: [
            { index: true, lazy: lazy(() => import('@/pages/account/AccountOverviewPage')) },
            { path: 'perfil', lazy: lazy(() => import('@/pages/account/ProfilePage')) },
            { path: 'favoritos', lazy: lazy(() => import('@/pages/account/FavoritesPage')) },
            { path: 'mensajes', lazy: lazy(() => import('@/pages/account/MessagesPage')) },
            { path: 'solicitudes', lazy: lazy(() => import('@/pages/account/RequestsPage')) },
            { path: 'publicaciones', lazy: lazy(() => import('@/pages/account/PublicationsPage')) },
            { path: 'notificaciones', lazy: lazy(() => import('@/pages/account/NotificationsPage')) },
            { path: 'membresia', lazy: lazy(() => import('@/pages/account/MembershipPage')) },
            { path: 'configuracion', lazy: lazy(() => import('@/pages/account/SettingsPage')) },
            { path: 'calendario', ...guarded(() => import('@/pages/account/CalendarPage'), 'calendar:manage') },
            { path: 'recursos/gestion', ...guarded(() => import('@/pages/account/ResourceManagementPage'), 'resources:manage') },
          ],
        }],
      },

      {
        path: 'publicar',
        element: <ProtectedRoute permission="publications:create" />,
        children: [
          { index: true, lazy: lazy(() => import('@/pages/publishing/PublishChooserPage')) },
          { path: 'sala', lazy: lazy(() => import('@/pages/publishing/VenueFormPage')) },
          { path: 'espectaculo', lazy: lazy(() => import('@/pages/publishing/ShowFormPage')) },
          { path: 'servicio', lazy: lazy(() => import('@/pages/publishing/ServiceFormPage')) },
          { path: 'convocatoria', lazy: lazy(() => import('@/pages/publishing/OpportunityFormPage')) },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // El panel administrativo tiene su propio marco, separado del sitio público.
  {
    path: 'admin',
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoading />,
    element: <ProtectedRoute permission="admin:access" />,
    children: [{
      lazy: lazy(() => import('@/pages/admin/AdminLayout')),
      children: [
        { index: true, lazy: lazy(() => import('@/pages/admin/AdminDashboardPage')) },
        { path: 'usuarios', ...guarded(() => import('@/pages/admin/AdminUsersPage'), 'admin:users') },
        { path: 'publicaciones', ...guarded(() => import('@/pages/admin/AdminModerationPage'), 'admin:moderate') },
        { path: 'oportunidades', ...guarded(() => import('@/pages/admin/AdminOpportunitiesPage'), 'admin:moderate') },
        { path: 'recursos', ...guarded(() => import('@/pages/admin/AdminResourcesPage'), 'resources:manage') },
        { path: 'membresias', ...guarded(() => import('@/pages/admin/AdminMembershipsPage'), 'admin:plans') },
        { path: 'reportes', ...guarded(() => import('@/pages/admin/AdminReportsPage'), 'admin:reports') },
        { path: 'configuracion', ...guarded(() => import('@/pages/admin/AdminSettingsPage'), 'admin:config') },
      ],
    }],
  },
]

export const router = createBrowserRouter(routes)
