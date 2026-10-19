# Pruebas y resultados

Ejecutadas el 19/10/2026 con Node 24.20 en Windows 11.

```bash
npm test         # vitest run
npm run build    # vite build
```

## Resultado

- **Pruebas:** 5 archivos, **104 pruebas, 104 pasan**.
- **Compilación de producción:** sin errores ni advertencias.
- **Sin TypeScript:** 0 archivos `.ts` o `.tsx` en `src/`.
- **Revisión estática:** no hay `href="#"`, `alert()`, `localStorage` ni `dangerouslySetInnerHTML` en `src/`.

## Qué cubren

| Archivo | Cubre |
| --- | --- |
| `src/utils/workflows.test.js` | Transiciones válidas e inválidas de reservas, consultas, postulaciones y publicaciones; estado "vencida" calculado por fecha. |
| `src/constants/permissions.test.js` | Roles efectivos y múltiples perfiles, membresía activa o vencida, premium, permisos administrativos. |
| `src/services/services.test.js` | Catálogos solo con contenido publicado; filtros, orden y búsqueda sin acentos; privacidad de los contactos; fechas sin información; solicitudes pendientes frente a reservas; doble reserva; nueva comprobación al aceptar; historial; propuesta de fecha; postulaciones (vencida, duplicada, espectáculo ajeno); acceso a recursos en la capa de datos; moderación; slug duplicado; eliminación; permisos de admin; indicadores calculados. |
| `src/app/navigation.test.jsx` | Home, filtros por URL, tarjeta que abre el detalle, redirección a ingresar y vuelta, acceso denegado al admin, recurso bloqueado, validación del registro, borrador de sala que aparece en Mis publicaciones, 404 y detalle inexistente. |
| `src/app/routes.smoke.test.jsx` | Las 47 rutas principales abren directamente con el usuario que corresponde, sin errores de consola ni pantalla de error. |

Las pruebas fijan la fecha en 19/10/2026 para no depender del día en que se ejecutan.

## Verificación visual

Se tomaron capturas con Edge headless del inicio, el catálogo de salas y el detalle de sala, en escritorio (1366 px) y en móvil (390 px). Se corrigió una cosa: en móvil el panel de acciones del detalle ahora aparece antes del contenido.

## No se ejecutó

- **Playwright (pruebas de punta a punta):** no está instalado en el proyecto. Las pruebas de navegación usan Testing Library con el router real.
- **Formulario de contacto con envío real:** requiere SMTP. Se probó que la API responde el desafío (200) y rechaza datos inválidos (422).
