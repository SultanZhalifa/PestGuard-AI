import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/html2canvas')) {
            return 'pdf-vendor';
          }
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ['**/backend/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})

