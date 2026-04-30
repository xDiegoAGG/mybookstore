import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/books/': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      }
    }
  }
})
