# Integraciones pendientes para producción

| Integración | Estado | Qué hace falta |
| --- | --- | --- |
| **Backend / API de datos** | No existe | API con base de datos (ej. Node + PostgreSQL). Reemplazar cada servicio de `src/services` manteniendo su firma. |
| **Autenticación** | Simulada (modo demo) | Proveedor real (Auth0, Supabase Auth, Cognito o backend propio) con contraseñas hasheadas (argon2 o bcrypt), verificación de email, recuperación de contraseña y sesión por cookie `httpOnly`. Reemplazar `authService` y `services/adapter/session.js`. |
| **Pagos y suscripciones** | No existe | Mercado Pago o Stripe: checkout, webhooks que activen `Membership` en el servidor y `providerSubscriptionId`. La demo **no** cobra. |
| **Almacenamiento de archivos** | No existe | S3, Cloudinary o similar para fotos, dossiers y fichas técnicas. Hacen falta URLs firmadas para los archivos de miembros. `FileUpload` ya valida tipo y tamaño en el cliente. |
| **Email transaccional** | Solo el formulario de contacto | Avisos de solicitudes, mensajes y moderación (la estructura de `Notification` ya está pensada para esto). |
| **Mensajería en tiempo real** | No existe | WebSockets o un servicio de terceros. Hoy los mensajes se ven al recargar. |
| **Búsqueda en servidor** | Local | Con más volumen: búsqueda de texto completo en la base de datos (PostgreSQL FTS, Meilisearch). `searchService.search(q, scope)` mantiene la firma. |
| **Formulario de contacto** | Funciona con `api/server.mjs` | Configurar SMTP en `api/.env`. |
| **Fotografía** | Sin fotos | Las portadas usan el patrón de marca. Cargar fotografía escénica con licencia o propia. |
| **Textos legales** | Provisorios | Revisión legal de términos y privacidad (Ley 18.331). |
| **Analítica** | No existe | Si se agrega, con consentimiento y actualizando la política de privacidad y la CSP de nginx. |
