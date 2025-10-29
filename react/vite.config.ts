import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({ 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      '@packages': path.resolve(__dirname, './packages'),
    },
  },
  plugins: [react(), tailwindcss()],
  server: { port: 5173 } 
})
