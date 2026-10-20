# Noticias de artes escénicas

La sección `/noticias` muestra noticias reales de teatro, danza, música en vivo, ópera, circo, títeres, carnaval y festivales de artes escénicas. Uruguay es el bloque principal (Montevideo y el interior) e Internacional va abajo, con Latinoamérica primero.

## Cómo funciona

```
fuentes (RSS/Atom)  ──cada 1 h──▶  servicio news (Docker)  ──▶  volumen news-data (news.json)
                                                                        │
navegador ──GET /api/news──▶ nginx ──▶ servicio news ── lee lo guardado ┘
```

- **La tarea programada vive en el servidor** (`news/lib/scheduler.mjs`), dentro del servicio `news` del `docker-compose.yml`. Corre aunque nadie esté navegando. El próximo horario se calcula desde la última ejecución guardada, así que reiniciar el contenedor no adelanta ni saltea una corrida. El navegador nunca dispara actualizaciones.
- **La página lee lo guardado.** Si una fuente o toda una corrida falla, se sigue mostrando lo que ya estaba.
- **Sin ejecuciones simultáneas.** Un archivo de candado (`ingest.lock`) impide que dos corridas se pisen, ya sea la programada y una manual o dos procesos distintos. Un candado de más de 30 minutos se considera de un proceso muerto y se reemplaza.
- **Escritura atómica.** Se escribe a un archivo temporal que después se renombra. Un corte a mitad de escritura no deja el archivo roto.

## Qué hace cada corrida (`news/lib/ingest.mjs`)

1. **Trae cada feed habilitado de `news/sources.json`**, de a 4 en paralelo:
   - Timeout de 20 s y máximo de 5 MB por feed.
   - Se identifica honestamente como `TRAMA-Noticias/1.0`.
   - Manda `If-None-Match` / `If-Modified-Since`, así un feed sin cambios responde 304 y no cuesta nada.
2. **Por cada nota:**
   - Descarta las que no tienen fecha, porque no se inventa una.
   - Descarta las que están fuera de la retención o tienen fecha futura.
   - Descarta las que no son de artes escénicas.
   - Descarta agendas, carteleras, sorteos y fichas de venta de entradas.
3. **Clasifica** (`news/lib/classify.mjs`, `news/lib/geo.mjs`):
   - **Disciplina:** por palabras clave en el título y el resumen del medio. Evita usos que no son escénicos, como "teatro de operaciones" u "opera" como verbo.
   - **Festivales:** el FIDAE, el FITDAP y el FIDCU por su sigla; cualquier "festival (internacional) de teatro / danza / artes escénicas / circo / títeres"; y los grandes festivales internacionales (Cervantino, Santiago a Mil, Avignon, Fringe). "Artes escénicas" a secas también cuenta.
   - **Otros festivales:** una nota cuyo título habla de cine, películas, libros o vinos, y no nombra ninguna disciplina escénica, queda afuera aunque el resumen mencione un teatro.
   - **Ubicación:** los 19 departamentos y sus localidades principales. Los nombres que también son palabras comunes o apellidos (Salto, Rivera, Flores, Artigas, Rosario…) solo cuentan después de una preposición ("en Salto"). Un medio del interior ubica sus notas en su departamento, salvo que el texto nombre otro lugar sin ambigüedad o hable del país entero ("en Uruguay"). Un medio extranjero solo pasa al bloque Uruguay si la nota nombra "Uruguay" o "Montevideo".
4. **Deduplica** (`news/lib/dedupe.mjs`):
   - **URL canónica:** sin parámetros de seguimiento, `www.`, `/amp` ni barra final.
   - **Título parecido** dentro de los 3 días: las mismas palabras en el mismo orden, o casi todas las palabras del título más corto con al menos 5 en común.
   - La copia queda registrada como alias, así la próxima corrida la reconoce enseguida.
5. **Actualiza** una noticia existente si su medio cambió el título, el resumen o la imagen.
6. **Aplica la retención:** borra lo publicado hace más de `NEWS_RETENTION_DAYS` días.
7. **Registra la corrida:**
   - Inicio, fin y estado (`ok`, `partial` o `failed`).
   - Por fuente: nuevas, actualizadas, duplicadas, descartadas o error.
   - Por fuente, además: último intento, último éxito, último error y fallas seguidas.
   - Se guardan las últimas 30 corridas.

**Qué se muestra de cada nota:**
- **Resumen:** el texto del propio medio, recortado a 280 caracteres. No se generan resúmenes ni se reproducen artículos completos.
- **Imagen:** solo la que el medio publica en su feed y solo por https. Si no hay o no carga, se usa la portada de TRAMA.

## Registro de fuentes (`news/sources.json`)

| Campo | Uso |
| --- | --- |
| `id`, `name`, `url`, `homepage` | Identidad del medio y su feed. `name` es la atribución visible. |
| `country` | Código ISO del país de cobertura. |
| `department`, `city` | Para medios del interior: dónde se ubican sus notas por defecto. |
| `scope` | `culture` (feed de cultura) o `general` (se filtra por palabras clave). Es informativo. |
| `linkPattern` | Opcional. Solo entran las notas cuyo enlace coincide (por ejemplo, las secciones `/cultura/` de la diaria). |
| `wordpressSearch` | Opcional, para sitios WordPress. Suma el feed oficial de búsqueda de cada palabra (`/?s=teatro&feed=rss2`). Es lo que da cobertura de teatro, danza y festivales a los diarios del interior. |
| `bodyImages` | `false` ignora las imágenes dentro del texto, para medios que insertan publicidad ahí. |
| `enabled`, `note` | `enabled: false` pausa una fuente sin borrarla, y `note` dice por qué. |

El servicio valida el registro al arrancar: id único, país y departamento existentes, URL y expresiones válidas. Un error de tipeo hace que el servicio no arranque, en vez de ubicar mal las noticias en silencio.

### Cobertura actual (verificada el 19-10-2026)

**El registro:** 60 medios e instituciones y 88 feeds contando las búsquedas de WordPress. Hay 2 pausados.

**Montevideo y nacionales:**
- **Medios:** El Observador, Montevideo Portal, Caras y Caretas, Búsqueda, Brecha, Subrayado, la diaria y Medios Públicos.
- **Instituciones:** SODRE y SUA.

**Interior:** medios e intendencias de Paysandú, Salto, Durazno, Maldonado, Colonia, Río Negro, Soriano, Rocha, Canelones, San José, Treinta y Tres, Tacuarembó y Artigas.

**Internacional:**
- **Latinoamérica:** Argentina, Chile, México, Brasil, Colombia y Perú.
- **Resto del mundo:** España, Reino Unido y Estados Unidos.

**Huecos conocidos:**
- **Sin fuente propia:** Florida, Flores, Lavalleja, Cerro Largo y Rivera. Sus medios no publican feeds y las páginas de gub.uy no tienen RSS. Igual aparecen cuando un medio nacional las nombra.
- **San José Ahora (San José):** bloquea los feeds con 403. Vale la pena pedirles acceso.
- **El País (Uruguay):** tiene feeds, pero responde 403 a clientes automatizados (protección anti-bots). Está pausado hasta que habiliten el acceso.

**Lo que no se hace:** no se hace scraping de páginas y no se esquivan bloqueos. Una fuente que no ofrece feed, o que lo bloquea, queda afuera.

### Agregar una fuente

1. Confirmar que el medio publica un feed RSS/Atom (`<link rel="alternate" type="application/rss+xml">`, `/feed/`, `/rss.xml`) y que no prohíbe su uso.
2. Agregar una línea a `news/sources.json` con su cobertura.
3. Probar sin tocar los datos reales: `cd news && NEWS_DATA_DIR=/tmp/prueba npm run ingest`.

## Servicio de búsqueda de noticias (no configurado)

Hoy alcanza con los feeds. Se evaluaron APIs de búsqueda para cubrir huecos, y ninguna gratuita sirve en producción:

| API | Situación |
| --- | --- |
| NewsAPI, GNews y Mediastack (planes gratis) | Sus condiciones no permiten uso comercial. GNews y Mediastack ni siquiera listan Uruguay. |
| Google News RSS | Muy buena cobertura del interior, pero sus condiciones son para uso personal, no comercial. |
| GNews Essential (≈ 50 EUR/mes) | Es la opción paga más barata con uso comercial, con cobertura débil de medios chicos uruguayos. |

Si se contrata una, va integrada desde el backend, con la clave en una variable de entorno de `news/.env`, y nunca en el navegador.

## Configuración (`news/.env`, opcional)

| Variable | Por defecto | Qué hace |
| --- | --- | --- |
| `NEWS_INTERVAL_HOURS` | `1` | Cada cuántas horas se consultan las fuentes. La página de Noticias muestra la cuenta regresiva hasta la próxima (`nextRunAt` en `/api/news`), así que no hay que cambiar nada más. |
| `NEWS_RETENTION_DAYS` | `180` | Días que se conserva una noticia desde su publicación. |
| `NEWS_SCHEDULER` | `on` en la imagen de Docker, apagado en local | Enciende la tarea programada. |
| `NEWS_DATA_DIR` | `/data` en Docker, `news/data` en local | Dónde se guardan las noticias. |

## Puesta en producción (servidor con Docker)

1. **En el servidor**, con Docker y el plugin de Compose instalados:

   ```bash
   git clone … && cd TRAMA
   cp api/.env.example api/.env        # SMTP del formulario de contacto
   # certificados HTTPS en certs/ (ver certs/README.md)
   docker compose up -d --build
   ```

   El servicio `news` arranca, hace la primera corrida en el momento y después corre cada hora. Las noticias quedan en el volumen `news-data`, que sobrevive a reinicios y a actualizaciones de la imagen.

2. **Verificar:**

   ```bash
   docker compose logs news                                     # "news: listening…", "ingest: ok…"
   docker compose exec news node -e "fetch('http://127.0.0.1:3000/status').then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,1)))"
   curl -s https://<dominio>/api/news?section=uy | head -c 300
   ```

   `/status` muestra la última corrida, la última actualización exitosa y el error de cada fuente. No está publicado en nginx: solo se consulta desde adentro del servidor.

3. **Correr una actualización a mano**, por ejemplo después de agregar fuentes: `docker compose exec news node ingest.mjs`. El candado evita que se superponga con la programada.

4. **Respaldo:** el volumen `news-data` se puede copiar con `docker run --rm -v trama_news-data:/data -v $PWD:/backup alpine tar czf /backup/news-data.tgz -C /data .`. Si se pierde, la próxima corrida lo vuelve a llenar con lo que tengan los feeds en ese momento.

## Pruebas

- **`cd news && npm test`:** parser RSS/Atom, disciplinas, agendas, ubicación (incluidos los nombres ambiguos), URL canónica y títulos parecidos. También cubre la actualización de registros, la corrida repetida sin duplicados, la misma noticia en dos medios, las fuentes que fallan (red, HTTP o un documento que no es un feed) sin perder lo guardado, el 304, el candado, la retención, las consultas, la prioridad de Latinoamérica, el horario de la tarea y la validación del registro. Todo corre contra feeds falsos, sin salir a internet.
- **`npm test` (frontend):** la página con los dos bloques, enlaces seguros, imagen de respaldo, "Cargar más", filtros en la URL y estados vacío y error.
- **CI:** además de los tests, construye la imagen `trama-news` y levanta los contenedores. Verifica que nginx sirva `/api/news` y rechace todo lo que no sea GET, y escanea la imagen con Trivy.
