/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment -- Плагин Steiger типизирует recommended-конфиг как any. */
import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/features/set-auction-bet/**'],
    rules: {
      // Фича владеет бизнес-операцией ставки, хотя сейчас у неё один потребитель.
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/app/providers/**'],
    rules: {
      // Providers — composition-root приложения, а не предметный FSD-сегмент.
      'fsd/segments-by-purpose': 'off',
    },
  },
])
