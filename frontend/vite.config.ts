import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward both the auth flow and the /api namespace to the backend
      // so the browser doesn't need to know about the backend origin.
      '/api': {
        target: process.env.VITE_BACKEND_URL ?? 'http://localhost:8787',
        changeOrigin: true,
      },
      '/auth': {
        target: process.env.VITE_BACKEND_URL ?? 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
