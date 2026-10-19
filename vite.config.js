import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    host: '127.0.0.1',
    // El formulario de contacto usa la API de api/server.mjs (npm run dev:api) y
    // Noticias, el servicio de news/server.mjs (npm run dev:news). El más
    // específico va primero.
    proxy: { '/api/news': 'http://127.0.0.1:3001', '/api': 'http://127.0.0.1:3000' },
  },
  build: { assetsInlineLimit: 0 },
  test: {
    // Solo los tests de la SPA: api/ tiene los suyos con node:test (cd api && npm test).
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
