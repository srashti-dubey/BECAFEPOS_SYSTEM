import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig(({ mode }) => {
  // Only VITE_-prefixed vars are exposed to app code via import.meta.env; the third arg ('')
  // widens loadEnv to also pick up unprefixed vars like API_UPSTREAM, which this dev-only proxy
  // needs but the browser bundle never should.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUpstream = env.API_UPSTREAM || 'http://10.3.33.31:3000'

  return {
  server: {
    host: true,
    port: 4153,
    strictPort: true,
    // In production nginx proxies /api/ to API_UPSTREAM (see Dockerfile). The Vite dev server
    // has no equivalent by default, so relative API calls (VITE_API_BASE_URL=/api/v1) would
    // just 404 against the dev server itself — this mirrors that nginx behavior for local dev.
    proxy: {
      '/api': {
        target: apiUpstream,
        changeOrigin: true,
      },
    },
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
      // devOptions.enabled deliberately left off: a dev-mode service worker intercepts/caches
      // module requests, which fights Vite's own HMR/module fetching and isn't needed for the
      // Dexie/IndexedDB offline data queue — that works with zero dependency on any service
      // worker. Only turn this on to specifically test app-shell offline caching, and expect to
      // manually unregister it (DevTools > Application > Service Workers) when done.

      manifest: {
        name: "BeCafe POS",
        short_name: "BeCafe",
        // nginx (docker/Dockerfile) and Vite both serve this app at the domain root, not
        // /Becafe/ — start_url/scope have to match where the app is actually served or the
        // manifest fails installability checks and the service worker won't control the page.
        start_url: "/",
        scope: "/",
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
  }
})
