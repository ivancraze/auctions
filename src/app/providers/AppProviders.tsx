import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from './queryClient'
import { router } from '../router/router'
import { GlobalErrorBoundary } from './GlobalErrorBoundary'
import { ToastViewport } from '@/shared/ui/toast/ToastViewport'

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
