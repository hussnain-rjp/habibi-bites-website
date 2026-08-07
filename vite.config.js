// Vite build disabled - Habibi Bites is deployed as static files directly to Vercel
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  }
});
