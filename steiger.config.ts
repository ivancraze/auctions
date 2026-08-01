/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment -- Steiger's recommended config is exposed as any. */
import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/**/*.test.{ts,tsx}'],
    rules: {
      // Page integration tests intentionally exercise the composed app router and providers.
      'fsd/forbidden-imports': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    files: ['./src/features/set-auction-bet/**'],
    rules: {
      // This business action owns validation and mutation orchestration despite one current consumer.
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/app/providers/**'],
    rules: {
      // Providers is the conventional application composition segment in this project.
      'fsd/segments-by-purpose': 'off',
    },
  },
])
