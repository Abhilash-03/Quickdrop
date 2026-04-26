import { create } from "zustand"

type AuthView = "login" | "signup"

interface AuthModalState {
  isOpen: boolean
  view: AuthView
  openLogin: () => void
  openSignup: () => void
  close: () => void
  switchView: (view: AuthView) => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",
  openLogin: () => set({ isOpen: true, view: "login" }),
  openSignup: () => set({ isOpen: true, view: "signup" }),
  close: () => set({ isOpen: false }),
  switchView: (view) => set({ view }),
}))
