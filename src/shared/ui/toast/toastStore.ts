import { create } from 'zustand'

type ToastKind = 'success' | 'error'

interface ToastMessage {
  id: number
  kind: ToastKind
  text: string
}

interface ToastState {
  toast: ToastMessage | null
  show: (kind: ToastKind, text: string) => void
  dismiss: () => void
}

let nextToastId = 1

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (kind, text) => set({ toast: { id: nextToastId++, kind, text } }),
  dismiss: () => set({ toast: null }),
}))
