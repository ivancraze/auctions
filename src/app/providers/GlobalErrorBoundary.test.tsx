import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GlobalErrorBoundary } from './GlobalErrorBoundary'

function BrokenComponent(): never {
  throw new Error('Test render failure')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GlobalErrorBoundary', () => {
  /** Проверяет безопасный fallback при необработанной ошибке React-дерева. */
  it('renders a safe fallback for an unhandled React error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <GlobalErrorBoundary>
        <BrokenComponent />
      </GlobalErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Приложение не смогло продолжить работу',
    )
    expect(
      screen.getByRole('link', { name: 'Вернуться к аукционам' }),
    ).toHaveAttribute('href', '/auctions')
  })
})
