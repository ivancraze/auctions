import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '@/mocks/server'
import { resetMockStore } from '@/mocks/store'
import { useToastStore } from '@/shared/ui/toast/toastStore'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockStore()
  useToastStore.setState({ toast: null })
})
afterAll(() => server.close())

Object.defineProperty(window, 'scrollTo', {
  value: () => undefined,
  writable: true,
})
