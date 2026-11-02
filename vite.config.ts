import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Playwright writes reports while tests run — watching them would reload the page mid-test.
  server: {
    watch: { ignored: ['**/playwright-report/**', '**/test-results/**', '**/tests/**'] },
  },
  // Pre-bundle everything in one pass: a second re-optimization can hit EBUSY file locks on Windows.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'motion/react', 'lucide-react'],
  },
})
