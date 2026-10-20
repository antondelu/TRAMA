import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

// Ajustes que solo corren dentro de las apps de Android e iOS (Capacitor).
// En la web no hacen nada. Las pantallas no importan este archivo: si algo
// tiene que comportarse distinto en la app, se resuelve acá o en src/services.
export const isNativeApp = Capacitor.isNativePlatform()

export function setupNativeApp() {
  if (!isNativeApp) return
  document.documentElement.classList.add('is-native-app')
  // Botón "atrás" de Android: vuelve en el historial y, en la primera pantalla, cierra la app.
  App.addListener('backButton', ({ canGoBack }) => (canGoBack ? window.history.back() : App.exitApp()))
}
