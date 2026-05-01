import { create } from "zustand"

interface QRScannerStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useQRScannerStore = create<QRScannerStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
