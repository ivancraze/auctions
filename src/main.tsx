import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers/AppProviders'

import '@/app/styles/global.scss'

async function enableMocking() {
  if (!import.meta.env.DEV) return

  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

function renderApp() {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    throw new Error('Root element was not found')
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
}

void enableMocking().then(renderApp)
