import { useEffect } from 'react'

import { useToastStore } from './toastStore'

export function ToastViewport() {
  const toast = useToastStore((state) => state.toast)
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(dismiss, 4500)
    return () => window.clearTimeout(timeoutId)
  }, [dismiss, toast])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.kind}`} role="status">
      <span>{toast.text}</span>
      <button aria-label="Закрыть уведомление" onClick={dismiss} type="button">
        ×
      </button>
    </div>
  )
}
