import { defineConfig } from 'orval'

export default defineConfig({
  auctionsZod: {
    input: {
      target: './openapi.auctions.v0.json',
    },
    output: {
      client: 'zod',
      mode: 'single',
      target: './src/shared/api/generated/zod.ts',
      override: {
        zod: {
          generateReusableSchemas: true,
          version: 3,
        },
      },
    },
  },
})
