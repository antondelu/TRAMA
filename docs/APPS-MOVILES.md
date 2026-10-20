# Apps de Android e iOS

TRAMA usa **un solo código** para la web y las apps. [Capacitor](https://capacitorjs.com) (la base de Ionic) toma el build de la web (`dist/`) y lo empaqueta como app nativa. Cada cambio en la web llega a las apps en el próximo build.

## Qué hay en el repo

| Archivo o carpeta | Para qué |
|---|---|
| `capacitor.config.json` | Nombre e identificador de la app, plugins. |
| `android/` | Proyecto de Android Studio. Se versiona; se toca solo para íconos, permisos y firma. |
| `ios/` | Proyecto de Xcode (Swift Package Manager, sin CocoaPods). Igual que `android/`. |
| `.env.mobile` | Variables del build de las apps (`VITE_SITE_URL`). |
| `src/platform/native.js` | Lo que solo corre dentro de la app: botón "atrás" de Android y la clase `is-native-app`. |

## Requisitos

- **Node 22** (`nvm use`, ver `.nvmrc`). Capacitor 8 no funciona con versiones anteriores.
- **Android:** [Android Studio](https://developer.android.com/studio), que trae el SDK y Java. Funciona en Linux, macOS y Windows.
- **iOS:** una Mac con **Xcode**. En Linux se puede actualizar el proyecto (`cap sync`), pero no compilarlo ni subirlo a la App Store.

## Comandos

```bash
npm run mobile:sync      # build de la web en modo "mobile" y copia a android/ e ios/
npm run mobile:android   # lo anterior y abre Android Studio
npm run mobile:ios       # lo anterior y abre Xcode (solo en Mac)
```

Desde Android Studio o Xcode se corre en un emulador o un teléfono, y se genera el paquete para las tiendas.

## La API dentro de la app

En la web, `/api/news` y `/api/contact` están en el mismo dominio que el sitio. La app no tiene servidor propio, así que su build los llama en la dirección de `VITE_SITE_URL` (en `.env.mobile`). Mientras esté vacía, Noticias y Contacto no funcionan en la app.

Los pedidos salen por **CapacitorHttp** (activado en `capacitor.config.json`): dentro de la app `fetch` es nativo y no aplica CORS, así que los servidores no necesitan cambios.

## Pendiente antes de publicar en las tiendas

- **Identificador de la app.** Hoy es `uy.trama.app`. Una vez publicada no se puede cambiar: confirmarlo antes de la primera subida.
- **Íconos y pantalla de inicio.** Hoy son los de Capacitor. Se generan con [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) a partir del logo.
- **Descargas de archivos subidos.** El CV y los PDF que se suben en la demo se guardan como `data:` URL. El atributo `download` no funciona en el WebView de Android ni iOS: con almacenamiento real (URL de un servidor) se resuelve solo.
- **Cuentas de desarrollador.** Google Play (pago único) y Apple Developer Program (anual).
- **Firma.** Keystore de Android y certificados de Apple. Nunca se versionan.
