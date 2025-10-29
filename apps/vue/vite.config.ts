import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()] as any,
  resolve: {
    alias: {
      '@packages': path.resolve(__dirname, './packages'),
    },
  },
  server: { port: 5174 },
})
