import { useCallback, useRef, useEffect } from "react"
import Peer, { DataConnection } from "peerjs"
import { useP2PStore, type P2PFile } from "@/lib/p2p-store"

// Generate a short room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Chunk size for file transfer (64KB)
const CHUNK_SIZE = 64 * 1024

// Limits
const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024 // 1GB
const CONNECTION_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const ROOM_EXPIRATION = 10 * 60 * 1000 // 10 minutes

// ICE servers configuration for better cross-platform compatibility (especially iOS Safari)
const ICE_SERVERS = [
  // Google STUN servers
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  // Cloudflare STUN
  { urls: "stun:stun.cloudflare.com:3478" },
  // Twilio STUN (free)
  { urls: "stun:global.stun.twilio.com:3478" },
  // Additional public STUN servers
  { urls: "stun:stun.services.mozilla.com:3478" },
]

// Peer configuration optimized for iOS Safari
const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10, // Pre-fetch candidates for faster connection
    sdpSemantics: "unified-plan" as const, // Required for Safari
  },
}

interface FileMetadata {
  type: "metadata"
  name: string
  size: number
  mime: string
}

interface FileChunk {
  type: "chunk"
  index: number
  data: ArrayBuffer
  isLast: boolean
}

interface TransferComplete {
  type: "complete"
}

type P2PMessage = FileMetadata | FileChunk | TransferComplete

// Wake Lock API type declarations
interface WakeLockSentinel {
  released: boolean
  type: "screen"
  release(): Promise<void>
  addEventListener(type: "release", listener: () => void): void
  removeEventListener(type: "release", listener: () => void): void
}

interface WakeLockAPI {
  request(type: "screen"): Promise<WakeLockSentinel>
}

export function useP2P() {
  const peerRef = useRef<Peer | null>(null)
  const connectionRef = useRef<DataConnection | null>(null)
  const fileRef = useRef<File | null>(null)
  const chunksRef = useRef<ArrayBuffer[]>([])
  const startTimeRef = useRef<number>(0)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const roomExpirationRef = useRef<NodeJS.Timeout | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    status,
    role,
    roomCode,
    peerId,
    file,
    progress,
    error,
    setStatus,
    setRole,
    setRoomCode,
    setPeerId,
    setError,
    setFile,
    setReceivedBlob,
    setProgress,
    reset,
  } = useP2PStore()

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
    if (roomExpirationRef.current) {
      clearTimeout(roomExpirationRef.current)
      roomExpirationRef.current = null
    }
  }, [])

  // Request wake lock to prevent screen sleep and tab throttling
  const requestWakeLock = useCallback(async () => {
    try {
      // Check if Wake Lock API is available
      if ("wakeLock" in navigator) {
        const wakeLock = navigator.wakeLock as WakeLockAPI
        wakeLockRef.current = await wakeLock.request("screen")
        console.log("[P2P] Wake lock acquired")
        
        // Re-acquire if released (e.g., tab goes to background then comes back)
        wakeLockRef.current.addEventListener("release", () => {
          console.log("[P2P] Wake lock released")
        })
      }
    } catch (err) {
      console.log("[P2P] Wake lock not available:", err)
    }
  }, [])

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        console.log("[P2P] Wake lock released manually")
      } catch (err) {
        console.log("[P2P] Error releasing wake lock:", err)
      }
    }
  }, [])

  // Start keep-alive interval to prevent connection timeout in background
  const startKeepAlive = useCallback(() => {
    // Clear any existing interval
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current)
    }
    
    // Send periodic pings to keep connection alive
    keepAliveIntervalRef.current = setInterval(() => {
      if (connectionRef.current && connectionRef.current.open) {
        try {
          connectionRef.current.send({ type: "ping" })
        } catch {
          // Ignore ping errors
        }
      }
    }, 5000) // Every 5 seconds
  }, [])

  // Stop keep-alive interval
  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current)
      keepAliveIntervalRef.current = null
    }
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    clearTimeouts()
    stopKeepAlive()
    releaseWakeLock()
    if (connectionRef.current) {
      connectionRef.current.close()
      connectionRef.current = null
    }
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }
    fileRef.current = null
    chunksRef.current = []
  }, [clearTimeouts, stopKeepAlive, releaseWakeLock])

  // Initialize as sender
  const initSender = useCallback(async (selectedFile: File) => {
    // Check file size limit
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is 1GB. Your file is ${(selectedFile.size / 1024 / 1024 / 1024).toFixed(2)}GB`)
      return
    }

    cleanup()
    reset()
    
    // Request wake lock to prevent background throttling
    await requestWakeLock()
    
    setRole("sender")
    setStatus("connecting")
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    })
    fileRef.current = selectedFile

    const code = generateRoomCode()
    
    // Create peer with room code as ID
    const peer = new Peer(`quickdrop-${code}`, PEER_CONFIG)

    peerRef.current = peer

    peer.on("open", (id) => {
      setPeerId(id)
      setRoomCode(code)
      setStatus("waiting")

      // Start connection timeout (5 minutes to wait for receiver)
      connectionTimeoutRef.current = setTimeout(() => {
        if (useP2PStore.getState().status === "waiting") {
          setError("Connection timeout. No one connected within 5 minutes.")
          cleanup()
        }
      }, CONNECTION_TIMEOUT)

      // Start room expiration (10 minutes total)
      roomExpirationRef.current = setTimeout(() => {
        const currentStatus = useP2PStore.getState().status
        if (currentStatus !== "completed" && currentStatus !== "error") {
          setError("Room expired after 10 minutes.")
          cleanup()
        }
      }, ROOM_EXPIRATION)
    })

    peer.on("connection", (conn) => {
      // Clear connection timeout since someone connected
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      
      connectionRef.current = conn
      setStatus("connected")
      startKeepAlive() // Start keep-alive pings

      conn.on("open", () => {
        // Send file metadata first
        const metadata: FileMetadata = {
          type: "metadata",
          name: selectedFile.name,
          size: selectedFile.size,
          mime: selectedFile.type,
        }
        conn.send(metadata)
      })

      conn.on("data", (data) => {
        const message = data as { type: string }
        // Ignore ping messages
        if (message.type === "ping") return
        if (message.type === "ready") {
          // Receiver is ready, start sending chunks
          sendFileChunks(conn, selectedFile)
        }
      })

      conn.on("close", () => {
        setStatus("idle")
      })

      conn.on("error", (err) => {
        setError(`Connection error: ${err.message}`)
      })
    })

    peer.on("error", (err) => {
      if (err.type === "unavailable-id") {
        // Room code already in use, generate a new one
        cleanup()
        initSender(selectedFile)
        return
      }
      setError(`Peer error: ${err.message}`)
    })

    peer.on("disconnected", () => {
      if (status !== "completed") {
        setError("Disconnected from server")
      }
    })
  }, [cleanup, reset, requestWakeLock, startKeepAlive, setRole, setStatus, setFile, setPeerId, setRoomCode, setError, status])

  // Send file in chunks
  const sendFileChunks = useCallback(async (conn: DataConnection, file: File) => {
    setStatus("transferring")
    startTimeRef.current = Date.now()
    
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let bytesSent = 0

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = await file.slice(start, end).arrayBuffer()
      
      const chunkMessage: FileChunk = {
        type: "chunk",
        index: i,
        data: chunk,
        isLast: i === totalChunks - 1,
      }
      
      conn.send(chunkMessage)
      bytesSent += chunk.byteLength
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const speed = bytesSent / elapsed
      
      setProgress({
        bytesTransferred: bytesSent,
        totalBytes: file.size,
        speed,
        percentage: Math.round((bytesSent / file.size) * 100),
      })

      // Small delay to prevent overwhelming the connection
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1))
      }
    }

    // Send completion message
    const completeMessage: TransferComplete = { type: "complete" }
    conn.send(completeMessage)
    setStatus("completed")
  }, [setStatus, setProgress])

  // Initialize as receiver
  const initReceiver = useCallback(async (code: string) => {
    cleanup()
    reset()
    
    // Request wake lock to prevent background throttling
    await requestWakeLock()
    
    setRole("receiver")
    setStatus("connecting")
    setRoomCode(code.toUpperCase())
    
    const peer = new Peer(PEER_CONFIG)

    peerRef.current = peer

    peer.on("open", (id) => {
      setPeerId(id)
      
      // Connect to sender with Safari-compatible options
      const conn = peer.connect(`quickdrop-${code.toUpperCase()}`, {
        reliable: true,
        serialization: "binary", // Better for file transfers on Safari
      })
      
      connectionRef.current = conn
      chunksRef.current = []

      conn.on("open", () => {
        setStatus("connected")
        startKeepAlive() // Start keep-alive pings
      })

      conn.on("data", (data) => {
        const message = data as P2PMessage
        // Ignore ping messages
        if ((message as { type: string }).type === "ping") return
        handleReceivedMessage(message, conn)
      })

      conn.on("close", () => {
        if (status !== "completed") {
          setStatus("idle")
        }
      })

      conn.on("error", (err) => {
        setError(`Connection error: ${err.message}`)
      })
    })

    peer.on("error", (err) => {
      if (err.type === "peer-unavailable") {
        setError("Room not found. Check the code and try again.")
        return
      }
      setError(`Connection failed: ${err.message}`)
    })
  }, [cleanup, reset, requestWakeLock, startKeepAlive, setRole, setStatus, setRoomCode, setPeerId, setError, status])

  // Handle received messages
  const handleReceivedMessage = useCallback((message: P2PMessage, conn: DataConnection) => {
    if (message.type === "metadata") {
      setFile({
        name: message.name,
        size: message.size,
        type: message.mime,
      })
      chunksRef.current = []
      startTimeRef.current = Date.now()
      setStatus("transferring")
      // Signal ready to receive
      conn.send({ type: "ready" })
    } else if (message.type === "chunk") {
      chunksRef.current[message.index] = message.data
      
      const bytesReceived = chunksRef.current.reduce(
        (acc, chunk) => acc + (chunk?.byteLength || 0),
        0
      )
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const speed = bytesReceived / elapsed
      
      const { file } = useP2PStore.getState()
      if (file) {
        setProgress({
          bytesTransferred: bytesReceived,
          totalBytes: file.size,
          speed,
          percentage: Math.round((bytesReceived / file.size) * 100),
        })
      }
    } else if (message.type === "complete") {
      // Combine all chunks into a blob
      const blob = new Blob(chunksRef.current)
      setReceivedBlob(blob)
      setStatus("completed")
      
      // Auto-trigger download
      const { file } = useP2PStore.getState()
      if (file) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }
  }, [setFile, setStatus, setProgress, setReceivedBlob])

  // Download received file
  const downloadFile = useCallback(() => {
    const { receivedBlob, file } = useP2PStore.getState()
    if (!receivedBlob || !file) return

    const url = URL.createObjectURL(receivedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Re-acquire wake lock when tab becomes visible again during active transfer
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Re-acquire wake lock if we're in an active transfer state
        const currentStatus = useP2PStore.getState().status
        if (
          currentStatus === "connecting" ||
          currentStatus === "waiting" ||
          currentStatus === "connected" ||
          currentStatus === "transferring"
        ) {
          await requestWakeLock()
          console.log("[P2P] Tab visible again, re-acquired wake lock")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [requestWakeLock])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    // State
    status,
    role,
    roomCode,
    peerId,
    file,
    progress,
    error,
    
    // Actions
    initSender,
    initReceiver,
    downloadFile,
    reset: () => {
      cleanup()
      reset()
    },
  }
}
