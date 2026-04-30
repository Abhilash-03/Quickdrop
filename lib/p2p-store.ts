import { create } from "zustand"

export type P2PStatus = 
  | "idle"
  | "connecting"
  | "waiting"
  | "connected"
  | "transferring"
  | "completed"
  | "error"

export type P2PRole = "sender" | "receiver" | null

export interface P2PFile {
  name: string
  size: number
  type: string
}

export interface TransferProgress {
  bytesTransferred: number
  totalBytes: number
  speed: number // bytes per second
  percentage: number
}

interface P2PState {
  // Connection state
  status: P2PStatus
  role: P2PRole
  roomCode: string | null
  peerId: string | null
  error: string | null
  
  // File state
  file: P2PFile | null
  receivedBlob: Blob | null
  progress: TransferProgress | null
  
  // Actions
  setStatus: (status: P2PStatus) => void
  setRole: (role: P2PRole) => void
  setRoomCode: (code: string | null) => void
  setPeerId: (id: string | null) => void
  setError: (error: string | null) => void
  setFile: (file: P2PFile | null) => void
  setReceivedBlob: (blob: Blob | null) => void
  setProgress: (progress: TransferProgress | null) => void
  reset: () => void
}

const initialState = {
  status: "idle" as P2PStatus,
  role: null as P2PRole,
  roomCode: null,
  peerId: null,
  error: null,
  file: null,
  receivedBlob: null,
  progress: null,
}

export const useP2PStore = create<P2PState>((set) => ({
  ...initialState,
  
  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPeerId: (peerId) => set({ peerId }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  setFile: (file) => set({ file }),
  setReceivedBlob: (receivedBlob) => set({ receivedBlob }),
  setProgress: (progress) => set({ progress }),
  
  reset: () => set(initialState),
}))
