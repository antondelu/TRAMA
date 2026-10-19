// Fotos elegidas en el navegador. En la demo no hay almacenamiento de archivos:
// la foto se achica y se guarda como data URL junto con la publicación. Con un
// servicio real (ver docs/INTEGRACIONES.md) acá se subiría y se guardaría su URL.
export function readImage(file, maxSide = 1600) {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(src)
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
      // Fondo blanco: los PNG con transparencia no quedan negros al pasar a JPG.
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({ url: canvas.toDataURL('image/jpeg', 0.82), width: canvas.width, height: canvas.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(src)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = src
  })
}

// Encuadre de una foto: punto visible (en % de ancho y alto) y zoom. Al ser
// relativo, cualquier vista (tarjeta, galería, app) lo recorta igual.
export const DEFAULT_FOCUS = { x: 50, y: 50, zoom: 1 }

// Estilo para un <img> con object-cover dentro de un contenedor con overflow oculto.
export function focusStyle(focus) {
  if (!focus) return undefined
  const { x, y, zoom } = { ...DEFAULT_FOCUS, ...focus }
  return {
    objectPosition: `${x}% ${y}%`,
    ...(zoom > 1 && { transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }),
  }
}
