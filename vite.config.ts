import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // Same hoisting hazard as apps/web: apps/mobile pins an older react at the workspace root.
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // 3100 is apps/web, 5173 is the desktop renderer.
    port: 3200,
  },
});
