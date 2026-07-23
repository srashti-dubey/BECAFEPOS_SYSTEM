import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  plugins: [react(),
     VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      manifest: {
        name: "BeCafe POS",
        short_name: "BeCafe",
        start_url: "/Becafe/",
        scope: "/Becafe/",
        display: "standalone",
        theme_color: "#1976d2",
        background_color: "#ffffff"
      }
    })
    
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
