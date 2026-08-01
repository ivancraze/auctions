import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ToastViewport, useToastStore } from '@/shared/ui'

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastViewport', () => {
  /** Проверяет assertive-роль ошибки и polite-роль успешного уведомления. */
  it('uses a live-region role matching the toast kind', () => {
    render(<ToastViewport />)

    act(() => useToastStore.getState().show('error', 'Ошибка сохранения'))
    expect(screen.getByRole('alert')).toHaveTextContent('Ошибка сохранения')

    act(() => useToastStore.getState().show('success', 'Данные сохранены'))
    expect(screen.getByRole('status')).toHaveTextContent('Данные сохранены')
  })

  /** Проверяет паузу автозакрытия, пока фокус находится на уведомлении. */
  it('keeps a focused toast visible until focus leaves it', async () => {
    vi.useFakeTimers()
    render(<ToastViewport />)

    act(() => useToastStore.getState().show('success', 'Данные сохранены'))
    const closeButton = screen.getByRole('button', {
      name: 'Закрыть уведомление',
    })

    fireEvent.focus(closeButton)
    await act(() => vi.advanceTimersByTimeAsync(5_000))
    expect(screen.getByRole('status')).toBeInTheDocument()

    fireEvent.blur(closeButton)
    await act(() => vi.advanceTimersByTimeAsync(4_500))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
