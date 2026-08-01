import { useEffect, useRef, useState } from 'react'

import { useToastStore } from './toastStore'

import styles from './ToastViewport.module.scss'

const AUTO_DISMISS_MS = 4500

export function ToastViewport() {
  const toast = useToastStore((state) => state.toast)
  const dismiss = useToastStore((state) => state.dismiss)
  const remainingTimeRef = useRef(AUTO_DISMISS_MS)
  const [hoveredToastId, setHoveredToastId] = useState<number | null>(null)
  const [focusedToastId, setFocusedToastId] = useState<number | null>(null)
  const isPaused =
    toast !== null &&
    (hoveredToastId === toast.id || focusedToastId === toast.id)

  useEffect(() => {
    remainingTimeRef.current = AUTO_DISMISS_MS
  }, [toast?.id])

  useEffect(() => {
    if (!toast || isPaused) return

    const startedAt = Date.now()
    const timeoutId = window.setTimeout(dismiss, remainingTimeRef.current)

    return () => {
      window.clearTimeout(timeoutId)
      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - (Date.now() - startedAt),
      )
    }
  }, [dismiss, isPaused, toast])

  if (!toast) return null

  const kindClass = toast.kind === 'success' ? styles.success : styles.error

  return (
    <div
      className={`${styles.toast} ${kindClass}`}
      aria-atomic="true"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedToastId(null)
        }
      }}
      onFocus={() => setFocusedToastId(toast.id)}
      onMouseEnter={() => setHoveredToastId(toast.id)}
      onMouseLeave={() => setHoveredToastId(null)}
      role={toast.kind === 'error' ? 'alert' : 'status'}
    >
      <span>{toast.text}</span>
      <button aria-label="Закрыть уведомление" onClick={dismiss} type="button">
        ×
      </button>
    </div>
  )
}
