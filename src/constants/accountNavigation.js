import { LayoutDashboard, User, Heart, MessageSquare, Inbox, FileStack, Bell, BadgeCheck, Settings, CalendarDays, Library } from 'lucide-react'

// Secciones de Mi cuenta, en grupos. Es la única lista: la usan la barra
// lateral de la cuenta, el menú del avatar y el menú de celular, así las
// secciones son las mismas y en el mismo orden en todos lados.
// Calendario y Gestión de recursos solo aparecen con permiso (las rutas
// también lo comprueban: no alcanza con ocultar el enlace).
export const ACCOUNT_HOME = { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, end: true }

export function accountGroups(can) {
  return [
    {
      id: 'received', title: 'Lo que te llegó',
      items: [
        { to: '/mi-cuenta/solicitudes', label: 'Solicitudes', icon: Inbox },
        { to: '/mi-cuenta/mensajes', label: 'Mensajes', icon: MessageSquare },
        { to: '/mi-cuenta/notificaciones', label: 'Notificaciones', icon: Bell },
      ],
    },
    {
      id: 'mine', title: 'Lo tuyo',
      items: [
        { to: '/mi-cuenta/publicaciones', label: 'Publicaciones', icon: FileStack },
        { to: '/mi-cuenta/favoritos', label: 'Favoritos', icon: Heart },
        ...(can('calendar:manage') ? [{ to: '/mi-cuenta/calendario', label: 'Calendario', icon: CalendarDays }] : []),
        ...(can('resources:manage') ? [{ to: '/mi-cuenta/recursos/gestion', label: 'Gestión de recursos', icon: Library }] : []),
      ],
    },
    {
      id: 'account', title: 'Tu cuenta',
      items: [
        { to: '/mi-cuenta/perfil', label: 'Perfil', icon: User },
        { to: '/mi-cuenta/membresia', label: 'Membresía', icon: BadgeCheck },
        { to: '/mi-cuenta/configuracion', label: 'Configuración', icon: Settings },
      ],
    },
  ]
}

// La sección en la que está la persona (la más específica que coincide).
export function currentAccountSection(pathname, can) {
  const all = [ACCOUNT_HOME, ...accountGroups(can).flatMap((g) => g.items)]
  return all.filter((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)))
    .sort((a, b) => b.to.length - a.to.length)[0] ?? ACCOUNT_HOME
}
