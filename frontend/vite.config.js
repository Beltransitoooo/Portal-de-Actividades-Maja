import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    // Node por defecto; los archivos de componentes piden jsdom con `// @vitest-environment jsdom`
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
  },
})
