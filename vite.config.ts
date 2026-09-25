import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `npm run build` is the production build and ships no sourcemaps;
// `npm run build:debug` produces the same bundle with .map files.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: { sourcemap: mode === 'debug' },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
