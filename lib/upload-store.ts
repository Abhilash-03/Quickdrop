import { create } from "zustand"

export type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

interface UploadFile {
  file: File
  progress: number
  status: UploadStatus
  error?: string
  shareUrl?: string
}

interface UploadState {
  currentFile: UploadFile | null
  expiresInHours: number
  downloadLimit: number
  setFile: (file: File) => void
  setProgress: (progress: number) => void
  setStatus: (status: UploadStatus) => void
  setError: (error: string) => void
  setShareUrl: (url: string) => void
  setExpiresInHours: (hours: number) => void
  setDownloadLimit: (limit: number) => void
  reset: () => void
}

export const useUploadStore = create<UploadState>((set) => ({
  currentFile: null,
  expiresInHours: 24,
  downloadLimit: 5,
  
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
  
  reset: () => set({ 
    currentFile: null, 
    expiresInHours: 24, 
    downloadLimit: 5 
  }),
}))
