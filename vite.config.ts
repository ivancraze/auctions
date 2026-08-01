import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { constants } from 'node:zlib'
import { defineConfig } from 'vite'
import { compression, defineAlgorithm } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithms: [
        defineAlgorithm('brotliCompress', {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 11,
          },
        }),
      ],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
