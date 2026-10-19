# TRAMA — Mercado profesional de las artes escénicas

Plataforma que conecta **salas, espectáculos, profesionales y recursos** del sector escénico. Mercado inicial: Uruguay (español rioplatense, UYU).

> **Versión de demostración.** Todos los datos son ficticios y viven en la pestaña del navegador. No hay pagos, reservas ni cuentas reales. Ver [docs/LIMITACIONES-DEMO.md](docs/LIMITACIONES-DEMO.md).

## Requisitos

- Node.js 20.11 o superior (probado con Node 24).
- npm 7 o superior.

## Instalación y ejecución

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo → http://127.0.0.1:5173
npm run build      # compilación de producción en dist/
npm run preview    # sirve dist/ localmente
npm test           # pruebas (Vitest + Testing Library)
npm run lint       # ESLint (React, hooks, accesibilidad)
npm run format     # formatea con Prettier (todavía no lo exige la CI)
```

`npm start` es un alias de `npm run dev`.

### Formulario de contacto (opcional)

Es la única parte que habla con un servidor. Usa la API reutilizada del proyecto base:

```bash
cd api && npm install && cd ..
cp api/.env.example api/.env   # completar SMTP
npm run dev:api                # API en el puerto 3000 (Vite la expone en /api)
```

Sin la API, la página de contacto muestra un aviso claro en lugar de fallar en silencio.

## Cuentas de demostración

En `/ingresar` hay accesos rápidos (sin contraseña):

| Cuenta | Para probar |
| --- | --- |
| Lucía Barreiro | Responsable de dos salas, miembro. Calendario, solicitudes recibidas, conflicto de fechas. |
| Mateo Silvera | Compañía y profesional de servicios a la vez. Postulaciones, consultas, mensajes. |
| Sofía Rial | Programadora de festival, plan Profesional (acceso premium). |
| Joaquín Méndez | Usuario nuevo sin membresía: ve recursos bloqueados. |
| Valentina Ocampo | Editora y moderadora: gestión de recursos y moderación. |
| Andrés Pereyra | Administrador: usuarios, roles, planes, configuración. |

En **Mi cuenta › Configuración** hay un botón para restablecer los datos de la demo.

## Estructura

```
src/
  app/            App, router y providers
  components/     UI reutilizable (layout, navigation, ui, forms, cards, filters, calendar, media, auth)
  pages/          una carpeta por sección (home, venues, shows, services, opportunities, resources, auth, account, publishing, admin, legal, info, search)
  features/       lógica de dominio con UI propia (favorites, bookings, inquiries, applications, memberships, publishing, resources, auth)
  hooks/          useServiceQuery, useUrlFilters, useUnsavedChanges...
  services/       capa de acceso a datos (reemplazable por una API)
  data/mock/      datos de demostración
  context/        sesión y avisos
  constants/      taxonomías, permisos, navegación
  utils/          formato, fechas, máquinas de estado, validación
  config/         configuración de app e integraciones
api/              API de contacto (Node + nodemailer), reutilizada de BOLD
docker/           nginx endurecido, reutilizado de BOLD y adaptado a SPA
```

## Documentación

- [Arquitectura, modelo de datos, roles y reglas](docs/ARQUITECTURA.md)
- [Integraciones pendientes para producción](docs/INTEGRACIONES.md)
- [Limitaciones del modo demo](docs/LIMITACIONES-DEMO.md)
- [Pruebas y resultados](docs/PRUEBAS.md)

## Qué se reutilizó del proyecto base

- Stack: Vite 6, React 18, Tailwind CSS 4, lucide-react, react-hook-form.
- API de contacto (`api/server.mjs`): SMTP, desafío anti-spam firmado y campo trampa. Se quitaron correos y dominios de BOLD.
- Docker + nginx endurecido (cabeceras de seguridad, límites de tasa, TLS). Se adaptó a SPA (fallback a `index.html`) y a npm.

Qué **no** se reutilizó y por qué: los componentes de BOLD eran `.tsx` (TypeScript) y la especificación de TRAMA pide JavaScript sin TypeScript; además estaban atados a MUI/Radix y al contenido de BOLD.

## Despliegue con Docker

```bash
cp api/.env.example api/.env     # SMTP real
# certificados TLS en certs/fullchain.pem y certs/privkey.pem
docker compose up -d --build
```

Antes de publicar en producción, revisar [docs/INTEGRACIONES.md](docs/INTEGRACIONES.md): el modo demo **no** es seguro para usuarios reales.
