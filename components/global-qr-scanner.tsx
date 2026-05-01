"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, SwitchCamera, Loader2, AlertTriangle, ExternalLink, Zap, Cloud, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQRScannerStore } from "@/lib/qr-scanner-store"
import { toast } from "sonner"

type ScanResult = {
  type: "flash" | "drop" | "external" | "unknown"
  code?: string
  url?: string
  display: string
}

export function GlobalQRScanner() {
  const { isOpen, close } = useQRScannerStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrcodeRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const hasScannedRef = useRef(false)

  // Parse scanned text and determine type
  const parseScannedText = useCallback((text: string): ScanResult => {
    const trimmed = text.trim()
    
    // Try to parse as URL
    try {
      const url = new URL(trimmed)
      const pathname = url.pathname
      const params = url.searchParams
      
      // Check for Flash/P2P code in URL params
      const codeParam = params.get("code")
      if (codeParam && /^[A-Z0-9]{6}$/i.test(codeParam)) {
        if (pathname.includes("/flash") || pathname.includes("/p2p")) {
          return {
            type: "flash",
            code: codeParam.toUpperCase(),
            url: trimmed,
            display: `Flash Transfer: ${codeParam.toUpperCase()}`
          }
        }
      }
      
      // Check for Drop download link (/d/[code])
      const dropMatch = pathname.match(/^\/d\/([a-zA-Z0-9_-]+)$/)
      if (dropMatch) {
        return {
          type: "drop",
          code: dropMatch[1],
          url: trimmed,
          display: `Download: ${dropMatch[1].slice(0, 8)}...`
        }
      }
      
      // Check if it's our domain but different path
      const currentHost = typeof window !== "undefined" ? window.location.host : ""
      if (url.host === currentHost) {
        return {
          type: "external",
          url: pathname + url.search,
          display: `Go to: ${pathname}`
        }
      }
      
      // External URL
      return {
        type: "external",
        url: trimmed,
        display: `Open: ${url.host}${pathname.slice(0, 20)}...`
      }
    } catch {
      // Not a URL
    }
    
    // Check for direct 6-character Flash code
    if (/^[A-Z0-9]{6}$/i.test(trimmed)) {
      return {
        type: "flash",
        code: trimmed.toUpperCase(),
        display: `Flash Code: ${trimmed.toUpperCase()}`
      }
    }
    
    // Unknown format
    return {
      type: "unknown",
      display: trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "")
    }
  }, [])

  // Handle the scan result action
  const handleAction = useCallback(() => {
    if (!scanResult) return
    
    close()
    
    switch (scanResult.type) {
      case "flash":
        if (scanResult.code) {
          router.push(`/flash?code=${scanResult.code}`)
          toast.success("Connecting to Flash transfer...")
        }
        break
      case "drop":
        if (scanResult.code) {
          router.push(`/d/${scanResult.code}`)
          toast.success("Opening download page...")
        }
        break
      case "external":
        if (scanResult.url) {
          if (scanResult.url.startsWith("/")) {
            router.push(scanResult.url)
          } else {
            window.open(scanResult.url, "_blank", "noopener,noreferrer")
            toast.success("Opening link in new tab...")
          }
        }
        break
      case "unknown":
        // Copy to clipboard
        navigator.clipboard.writeText(scanResult.display)
        toast.info("Text copied to clipboard")
        break
    }
  }, [scanResult, close, router])

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || !isMountedRef.current) return

    setIsLoading(true)
    setError(null)
    setScanResult(null)
    hasScannedRef.current = false

    // Check if we're in a secure context
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setIsLoading(false)
      setError("Camera requires HTTPS. Please use a secure connection.")
      return
    }

    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsLoading(false)
      setError("Camera not supported in this browser.")
      return
    }

    try {
      // Test camera permission
      const testStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      testStream.getTracks().forEach(track => track.stop())
      
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode")
      
      if (!isMountedRef.current) return
      
      // Clean up previous instance
      if (html5QrcodeRef.current) {
        try {
          const state = html5QrcodeRef.current.getState()
          if (state === 2) {
            await html5QrcodeRef.current.stop()
          }
        } catch {
          // Ignore
        }
        html5QrcodeRef.current = null
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (!isMountedRef.current) return
      
      const container = document.getElementById("global-qr-reader")
      if (!container) {
        setIsLoading(false)
        setError("Scanner initialization failed. Please try again.")
        return
      }

      const scanner = new Html5Qrcode("global-qr-reader", { verbose: false })
      html5QrcodeRef.current = scanner

      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText: string) => {
          if (hasScannedRef.current) return
          hasScannedRef.current = true
          
          console.log("Global QR Scanned:", decodedText)
          
          const result = parseScannedText(decodedText)
          setScanResult(result)
          
          // Stop scanner
          if (html5QrcodeRef.current) {
            html5QrcodeRef.current.stop().catch(() => {})
            html5QrcodeRef.current = null
          }
        },
        () => {
          // Keep scanning
        }
      )

      if (isMountedRef.current) {
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Global QR Scanner error:", err)
      
      if (!isMountedRef.current) return
      
      setIsLoading(false)
      
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes("permission") || msg.includes("notallowed")) {
          setError("Camera permission denied. Please allow camera access.")
        } else if (msg.includes("notfound") || msg.includes("no camera")) {
          setError("No camera found on this device.")
        } else if (msg.includes("notreadable") || msg.includes("could not start")) {
          setError("Camera is in use by another app.")
        } else if (msg.includes("overconstrained")) {
          if (facingMode === "environment") {
            setFacingMode("user")
            return
          }
          setError("Camera not compatible.")
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError("Failed to start camera.")
      }
    }
  }, [facingMode, parseScannedText])

  // Start/stop scanner based on isOpen
  useEffect(() => {
    if (!isOpen) return
    
    isMountedRef.current = true
    hasScannedRef.current = false
    setScanResult(null)
    
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startScanner()
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
      
      if (html5QrcodeRef.current && !hasScannedRef.current) {
        try {
          const state = html5QrcodeRef.current.getState()
          if (state === 2) {
            html5QrcodeRef.current.stop().catch(() => {})
          }
        } catch {
          // Ignore
        }
      }
    }
  }, [isOpen, startScanner])

  const handleSwitchCamera = async () => {
    if (hasScannedRef.current) return
    
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState()
        if (state === 2) {
          await html5QrcodeRef.current.stop()
        }
      } catch {
        // Ignore
      }
      html5QrcodeRef.current = null
    }
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  const handleClose = async () => {
    if (html5QrcodeRef.current && !hasScannedRef.current) {
      try {
        const state = html5QrcodeRef.current.getState()
        if (state === 2) {
          await html5QrcodeRef.current.stop()
        }
      } catch {
        // Ignore
      }
    }
    html5QrcodeRef.current = null
    close()
  }

  const handleRescan = () => {
    hasScannedRef.current = false
    setScanResult(null)
    startScanner()
  }

  const getResultIcon = () => {
    switch (scanResult?.type) {
      case "flash":
        return <Zap className="h-6 w-6 text-primary" />
      case "drop":
        return <Cloud className="h-6 w-6 text-primary" />
      case "external":
        return <ExternalLink className="h-6 w-6 text-primary" />
      default:
        return <Link2 className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getActionLabel = () => {
    switch (scanResult?.type) {
      case "flash":
        return "Connect"
      case "drop":
        return "Download"
      case "external":
        return "Open"
      default:
        return "Copy"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
        >
          <div className="relative h-full w-full flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                <span className="font-medium">Scan QR Code</span>
              </div>
              <div className="flex gap-2">
                {!scanResult && !error && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSwitchCamera}
                    className="text-white hover:bg-white/20"
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scanner or Result */}
            <div className="w-full max-w-sm">
              {/* Scanner Container */}
              {!scanResult && (
                <div
                  ref={scannerRef}
                  className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black"
                >
                  <div id="global-qr-reader" className="h-full w-full" />
                  
                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                      <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                      <p className="text-sm text-white/80">Starting camera...</p>
                    </div>
                  )}
                  
                  {/* Error Overlay */}
                  {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6">
                      <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                      <p className="text-sm text-white/80 text-center">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startScanner()}
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  
                  {/* Scan Frame */}
                  {!isLoading && !error && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-56 h-56 relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scan Result */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      {getResultIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground capitalize">{scanResult.type} QR Code</p>
                      <p className="font-medium truncate">{scanResult.display}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleRescan}
                    >
                      Scan Again
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAction}
                    >
                      {getActionLabel()}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Instructions */}
              {!scanResult && !error && !isLoading && (
                <p className="text-center text-white/60 text-sm mt-4">
                  Point camera at any QuickDrop QR code
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
