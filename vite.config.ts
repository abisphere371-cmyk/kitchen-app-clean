import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true
        // no rewrite — keep "/api" so it matches Express routes
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});