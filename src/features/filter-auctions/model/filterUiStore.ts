import { create } from 'zustand'

interface FilterUiState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useFilterUiStore = create<FilterUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
