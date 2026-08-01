import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { router } from '../router/router'
import { GlobalErrorBoundary } from './GlobalErrorBoundary'
import { queryClient } from './queryClient'
import { ToastViewport } from '@/shared/ui'

export function AppProviders() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastViewport />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}
