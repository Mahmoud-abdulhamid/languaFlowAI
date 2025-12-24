import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    port: 5173,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'framer-motion'],
                ui: ['lucide-react', '@radix-ui/react-popover']
            }
        }
    }
  }
})
