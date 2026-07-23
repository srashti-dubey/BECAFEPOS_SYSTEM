import { create } from 'zustand'

interface FeatureTemplateStoreState {
  items: string[]
  setItems: (items: string[]) => void
}

export const useFeatureTemplateStore = create<FeatureTemplateStoreState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
