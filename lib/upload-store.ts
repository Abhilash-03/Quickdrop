import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

interface UploadFile {
  file: File
  progress: number
  status: UploadStatus
  error?: string
  shareUrl?: string
}

export interface ShareHistoryItem {
  id: string
  filename: string
  size: number
  shareUrl: string
  expiresInHours: number
  downloadLimit: number
  createdAt: number
}

interface UploadState {
  currentFile: UploadFile | null
  expiresInHours: number
  downloadLimit: number
  password: string
  shareHistory: ShareHistoryItem[]
  setFile: (file: File) => void
  setProgress: (progress: number) => void
  setStatus: (status: UploadStatus) => void
  setError: (error: string) => void
  setShareUrl: (url: string) => void
  setExpiresInHours: (hours: number) => void
  setDownloadLimit: (limit: number) => void
  setPassword: (password: string) => void
  reset: () => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      currentFile: null,
      expiresInHours: 24,
      downloadLimit: 5,
      password: "",
      shareHistory: [],
  
  setFile: (file) => set({ 
    currentFile: { file, progress: 0, status: "idle" } 
  }),
  
  setProgress: (progress) => set((state) => ({
    currentFile: state.currentFile 
      ? { ...state.currentFile, progress } 
      : null
  })),
  
  setStatus: (status) => set((state) => ({
    currentFile: state.currentFile 
      ? { ...state.currentFile, status } 
      : null
  })),
  
  setError: (error) => set((state) => ({
    currentFile: state.currentFile 
      ? { ...state.currentFile, status: "error", error } 
      : null
  })),
  
  setShareUrl: (shareUrl) => set((state) => ({
    currentFile: state.currentFile 
      ? { ...state.currentFile, status: "success", shareUrl } 
      : null
  })),
  
  setExpiresInHours: (expiresInHours) => set({ expiresInHours }),
  
  setDownloadLimit: (downloadLimit) => set({ downloadLimit }),

  setPassword: (password) => set({ password }),
  
  reset: () => set((state) => {
    // Add current file to history before resetting
    const newHistory = state.currentFile?.shareUrl && state.currentFile.status === "success"
      ? [
          {
            id: crypto.randomUUID(),
            filename: state.currentFile.file.name,
            size: state.currentFile.file.size,
            shareUrl: state.currentFile.shareUrl,
            expiresInHours: state.expiresInHours,
            downloadLimit: state.downloadLimit,
            createdAt: Date.now(),
          },
          ...state.shareHistory,
        ].slice(0, 20) // Keep only last 20 shares
      : state.shareHistory

    return {
      currentFile: null,
      expiresInHours: 24,
      downloadLimit: 5,
      password: "",
      shareHistory: newHistory,
    }
  }),

  removeFromHistory: (id) => set((state) => ({
    shareHistory: state.shareHistory.filter((item) => item.id !== id),
  })),

  clearHistory: () => set({ shareHistory: [] }),
}),
    {
      name: "quickdrop-uploads",
      partialize: (state) => ({ shareHistory: state.shareHistory }),
    }
  )
)
