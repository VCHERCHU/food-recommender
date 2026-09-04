import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages serves project sites from /<repo>/, so the deploy workflow
// sets VITE_BASE=/food-recommender/. Locally it defaults to /.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
