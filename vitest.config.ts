import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/mocks/**',
        'src/shared/api/generated/**',
        'src/test/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 75,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    environment: 'jsdom',
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: './src/test/setup.ts',
  },
})
