# Arquitectura de TRAMA

## Capas

| Capa | Dónde | Qué hace |
| --- | --- | --- |
| Interfaz | `src/components` | Componentes visuales sin lógica de negocio (botones, tarjetas, modales, calendario, filtros). |
| Páginas y navegación | `src/pages`, `src/app/router.jsx` | Una página por ruta; carga diferida por sección. |
| Lógica de frontend | `src/hooks`, `src/features`, `src/context` | Carga de datos, filtros en la URL, formularios, sesión, favoritos. |
| Servicios | `src/services` | Única puerta a los datos. Validan sesión, permisos y transiciones de estado. |
| Datos de demostración | `src/data/mock` | Semilla ficticia. |
| Integraciones | `src/config` | Qué está configurado y qué falta. |

### Cómo pasar a una API real

Las páginas solo importan desde `@/services`. Para conectar un backend:

1. Definir `VITE_API_URL`.
2. Reescribir cada servicio (`venuesService`, `showsService`, etc.) para que llame a la API con **la misma firma**. Por ejemplo, `venuesService.list(params)` pasa a `GET /venues?{params}` y devuelve `{ items, total, page, pageCount }`.
3. Eliminar `services/adapter/demoStore.js` y `services/adapter/session.js`.

Las validaciones que hoy hacen los servicios (permisos, máquinas de estado, doble reserva) **tienen que existir en el servidor**. En la demo, la capa de servicios cumple ese rol para poder probar los flujos.

### Estado

- Sesión: `AuthContext` (Context, sin Redux).
- Avisos: `ToastContext`.
- Favoritos: `FavoritesContext`.
- Datos remotos: `useServiceQuery`, que vuelve a pedir datos cuando cambian (se suscribe al adaptador).
- Filtros: en la URL (`useUrlFilters`), así se pueden compartir y el botón "atrás" funciona.

## Modelo de datos

Fechas en ISO 8601. Ids estables. Cada publicación guarda país y moneda para poder sumar mercados.

| Entidad | Colección demo | Campos principales |
| --- | --- | --- |
| User | `users` | id, email, firstName, lastName, avatar, bio, country, city, interests, roles, status, privacy, publicContact, notificationPrefs, createdAt, updatedAt |
| Venue | `venues` | id, ownerId, name, slug, description, country, department, city, address.area, capacity, venueType, technicalSpecs, equipment, accessibility, rentalModes, priceFrom, priceTo, priceUnit, currency, images, contactPreferences (privado), publicationStatus |
| VenueAvailability | `venueAvailability` | id, venueId, date, startDateTime, endDateTime, status (available, blocked, internal), notes, updatedAt |
| Show | `shows` | id, ownerId, title, slug, company, synopsis, description, discipline, genre, durationMinutes, castSize, audience, credits, technicalRider, touring, coproduction, bookingModes, priceFrom, currency, media, availability, publicationStatus |
| ProfessionalService | `professionals` | id, ownerId, name, slug, providerType, specialties, headline, description, location, workModes, portfolio, servicesOffered, availability, priceFrom, currency, links, contact (privado), verified, publicationStatus |
| Opportunity | `opportunities` | id, ownerId, venueId, organizationName, organizationType, title, slug, opportunityType, description, requirements, disciplines, location, compensation, documents, procedure, applicationStart, deadline, applicationMode (internal/external), externalUrl, originVerified, status |
| Resource | `resources` | id, authorId, author, title, slug, description, body, resourceType, category, topics, coverImage, mediaUrl, fileUrl, durationMinutes, accessLevel (public/member/premium), publicationStatus, publishedAt |
| MembershipPlan | `membershipPlans` | id, name, description, price, priceYearly, currency, billingPeriod, benefits, limits, accessRules, isActive |
| Membership | `memberships` | id, userId, planId, status, billing, startAt, endAt, providerSubscriptionId, demo |
| BookingRequest | `bookingRequests` | id, venueId, requesterId, date, timeSlot, startDateTime, endDateTime, activityType, functionCount, message, proposedDate, status, history |
| ShowInquiry | `showInquiries` | id, showId, requesterId, organization, venueName, requestedDates, functionCount, message, status, history |
| ServiceInquiry | `serviceInquiries` | id, serviceId, requesterId, projectType, projectDescription, requestedDate, location, budget, message, status, history |
| Application | `applications` | id, opportunityId, applicantId, showId, proposal, attachments, status, history |
| Favorite | `favorites` | id, userId, entityType, entityId, createdAt |
| Conversation | `conversations` | id, participantIds, relatedEntityType, relatedEntityId, subject, createdAt, updatedAt |
| Message | `messages` | id, conversationId, senderId, body, readAt, createdAt |
| Notification | `notifications` | id, userId, type, title, body, targetUrl, readAt, createdAt |
| Auditoría | `auditLog` | id, at, by, action o from/to, entityType, entityId, note |

Disponibilidad pública de una fecha (`availabilityMap`): combina lo que cargó la sala con las solicitudes. Los estados posibles son `unknown`, `available`, `pending`, `confirmed`, `blocked` e `internal`. Una fecha sin datos es `unknown` y nunca se muestra como libre.

## Máquinas de estado (`src/utils/workflows.js`)

**Publicaciones:** `draft → pending → published | rejected | changes_requested`. Además, `published → inactive` (lo hace el dueño) y `→ archived` (lo hace un moderador). El dueño nunca publica directamente, y editar algo publicado lo devuelve a moderación.

**Reservas, consultas de espectáculo y de servicio:** `draft → sent → in_conversation → accepted → completed`. Puede terminar en `rejected` (lo decide quien recibe) o `cancelled` (quien envía). La sala puede proponer otra fecha y quien pidió puede aceptarla. Aun así sigue sin confirmar hasta que la sala acepta.

**Postulaciones:** `sent → under_review → shortlisted → accepted | rejected`. Quien se postula puede retirarse (`withdrawn`).

Cada transición registra quién, cuándo, de qué estado a qué estado y una nota.

## Roles y permisos (`src/constants/permissions.js`)

| Rol | Cómo se obtiene |
| --- | --- |
| Visitante | Sin sesión. |
| Usuario registrado | Cualquier cuenta activa. |
| Responsable de sala / de espectáculo / profesional de servicios | Automático, por tener esas publicaciones. Una persona puede tener varios a la vez. |
| Miembro | Membresía activa (premium si el plan incluye `premium`). |
| Editor, Moderador, Administrador | Asignados por un administrador. |

### Reglas: qué está implementado y qué requiere backend

| # | Regla | En la demo | En producción |
| --- | --- | --- | --- |
| 1 | Visitantes exploran lo público | Sí | — |
| 2 | Favoritos y solicitudes requieren sesión | Sí (servicios + rutas) | Validar en el servidor |
| 3 | Solo el dueño edita lo suyo | Sí (`requireOwner`) | Validar en el servidor |
| 4 | Moderación antes de publicar | Sí | Validar en el servidor |
| 5 | Recursos exclusivos con membresía válida | Sí: el servicio **no entrega** el contenido protegido | El servidor no debe enviar `body`, `mediaUrl` ni `fileUrl`; los archivos, con URLs firmadas |
| 6 | Operaciones administrativas con permiso | Sí | Validar en el servidor y auditar |
| 7 | Datos privados fuera de perfiles públicos | Sí (los contactos privados se quitan en los servicios) | Igual en la API |
| 8 | Archivado o rechazado no aparece activo | Sí | — |
| 9 | Convocatoria vencida no admite postulaciones | Sí (se calcula por fecha) | Validar en el servidor |
| 10 | Aceptar requiere una transición explícita | Sí | Validar en el servidor |
| 11 | Cambios de estado validados en el servidor | No hay servidor | **Pendiente** |
| 12 | El frontend no es la única barrera | En la demo sí lo es | **Pendiente**: toda la autorización en el backend |

### Doble reserva

Al aceptar una reserva se vuelve a comprobar que no haya otra aceptada para esa fecha y que la sala tenga la fecha marcada como disponible. Las fechas con solicitudes o reservas no se pueden sobrescribir desde el calendario. En producción hace falta una restricción única o un bloqueo transaccional en la base de datos por `(venueId, fecha, franja)`.

## Seguridad y privacidad

Medidas en el frontend:
- No se guardan contraseñas.
- `sessionStorage` solo guarda el id de la cuenta demo y los datos ficticios.
- No se usa `dangerouslySetInnerHTML`: el contenido de los usuarios es texto plano escapado por React.
- Los archivos tienen límite de tipo y tamaño.
- Los enlaces de usuario exigen `https://`.
- Los destinos de "volver" después de ingresar solo pueden ser rutas internas.
- La API de contacto tiene desafío firmado, campo trampa y límites de tasa en nginx.

Antes de producción, el backend tiene que:
- Usar autenticación real con cookies `httpOnly`, `Secure` y `SameSite`.
- Validar y normalizar todos los datos con el mismo esquema (Zod en el servidor, por ejemplo).
- Revisar autorización en cada endpoint, sin confiar en los roles que envía el cliente.
- Proteger contra CSRF.
- Limitar la tasa de pedidos en el login, el registro y los formularios públicos.
- Agregar CAPTCHA o desafío en el registro.
- Analizar los archivos subidos (antivirus) y servirlos desde otro dominio.
- Llevar una auditoría persistente.
- Ofrecer borrado de cuenta conforme a la Ley 18.331.
