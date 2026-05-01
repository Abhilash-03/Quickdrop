"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, SwitchCamera, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrcodeRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const hasScannedRef = useRef(false) // Track if we've already scanned

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || !isMountedRef.current) return

    setIsLoading(true)
    setError(null)

    // Check if we're in a secure context (HTTPS or localhost)
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
      // First check camera permission by requesting and immediately stopping
      const testStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      // Stop the test stream immediately
      testStream.getTracks().forEach(track => track.stop())
      
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode")
      
      if (!isMountedRef.current) return
      
      // Clean up previous instance
      if (html5QrcodeRef.current) {
        try {
          const state = html5QrcodeRef.current.getState()
          if (state === 2) { // SCANNING state
            await html5QrcodeRef.current.stop()
          }
        } catch {
          // Ignore cleanup errors
        }
        html5QrcodeRef.current = null
      }

      // Small delay to ensure DOM is ready and camera is released
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (!isMountedRef.current) return
      
      // Make sure the container element exists
      const container = document.getElementById("qr-reader")
      if (!container) {
        setIsLoading(false)
        setError("Scanner initialization failed. Please try again.")
        return
      }

      const scanner = new Html5Qrcode("qr-reader", { verbose: false })
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
          // Prevent multiple scans
          if (hasScannedRef.current) return
          
          console.log("QR Scanned raw:", decodedText)
          
          // Extract room code from URL or use directly
          let code: string | null = null
          
          // Try to parse as URL first
          try {
            const url = new URL(decodedText)
            const urlCode = url.searchParams.get("code")
            if (urlCode && /^[A-Z0-9]{6}$/i.test(urlCode)) {
              code = urlCode.toUpperCase()
              console.log("Extracted code from URL params:", code)
            }
          } catch {
            // Not a valid URL, check if it's a direct code
          }
          
          // If not extracted from URL, check for direct code or regex match
          if (!code) {
            // Check if the entire text is a 6-character code
            if (/^[A-Z0-9]{6}$/i.test(decodedText.trim())) {
              code = decodedText.trim().toUpperCase()
              console.log("Direct 6-char code:", code)
            } 
            // Try regex as fallback for non-standard URLs
            else if (decodedText.includes("code=")) {
              const match = decodedText.match(/code=([A-Z0-9]{6})/i)
              if (match) {
                code = match[1].toUpperCase()
                console.log("Regex extracted code:", code)
              }
            }
          }
          
          // If no valid code found, keep scanning
          if (!code) {
            console.log("Invalid QR format, keep scanning")
            return
          }
          
          console.log("Final code to use:", code)

          // Mark as scanned to prevent duplicate processing
          hasScannedRef.current = true
          
          // Stop scanner first, then call onScan
          const stopAndNotify = async () => {
            try {
              if (html5QrcodeRef.current) {
                const state = html5QrcodeRef.current.getState()
                if (state === 2) { // SCANNING state
                  await html5QrcodeRef.current.stop()
                }
                html5QrcodeRef.current = null
              }
            } catch {
              // Ignore stop errors
            }
            // Call onScan after scanner is fully stopped
            onScan(code!)
          }
          
          stopAndNotify()
        },
        () => {
          // QR code not found in frame, keep scanning
        }
      )

      if (isMountedRef.current) {
        setIsLoading(false)
      }
    } catch (err) {
      console.error("QR Scanner error:", err)
      
      if (!isMountedRef.current) return
      
      setIsLoading(false)
      
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes("permission") || msg.includes("notallowed")) {
          setError("Camera permission denied. Please allow camera access in your browser settings.")
        } else if (msg.includes("notfound") || msg.includes("no camera") || msg.includes("requested device not found")) {
          setError("No camera found on this device.")
        } else if (msg.includes("notreadable") || msg.includes("could not start")) {
          setError("Camera is in use by another app. Close other apps and try again.")
        } else if (msg.includes("overconstrained")) {
          // Try with any camera if specific facing mode fails
          if (facingMode === "environment") {
            setFacingMode("user")
            return
          }
          setError("Camera not compatible. Try switching cameras.")
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError("Failed to start camera. Please try again.")
      }
    }
  }, [facingMode, onScan])

  // Start scanner on mount
  useEffect(() => {
    isMountedRef.current = true
    
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startScanner()
      }
    }, 100)

    // Cleanup on page unload/navigation
    const handleBeforeUnload = () => {
      if (html5QrcodeRef.current && !hasScannedRef.current) {
        try {
          html5QrcodeRef.current.stop().catch(() => {})
        } catch {
          // Ignore errors
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
      window.removeEventListener("beforeunload", handleBeforeUnload)
      
      // Cleanup on unmount - skip if already stopped by scan success
      if (html5QrcodeRef.current && !hasScannedRef.current) {
        try {
          const state = html5QrcodeRef.current.getState()
          if (state === 2) { // SCANNING state
            html5QrcodeRef.current.stop().catch(() => {})
          }
        } catch {
          // Ignore errors
        }
      }
    }
  }, [startScanner])

  const handleSwitchCamera = async () => {
    // Don't switch if already scanned
    if (hasScannedRef.current) return
    
    // Stop current scanner before switching
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState()
        if (state === 2) {
          await html5QrcodeRef.current.stop()
        }
      } catch {
        // Ignore stop errors
      }
      html5QrcodeRef.current = null
    }
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  const handleClose = async () => {
    // Stop scanner before closing (only if not already stopped by scan)
    if (html5QrcodeRef.current && !hasScannedRef.current) {
      try {
        const state = html5QrcodeRef.current.getState()
        if (state === 2) {
          await html5QrcodeRef.current.stop()
        }
      } catch {
        // Ignore stop errors
      }
      html5QrcodeRef.current = null
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Scanner container */}
        <div className="relative rounded-2xl overflow-hidden bg-black">
          {/* Camera view */}
          <div
            id="qr-reader"
            ref={scannerRef}
            className="w-full aspect-square"
          />

          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-white/80 text-sm">Starting camera...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6"
              >
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-white text-sm text-center mb-4 max-w-xs">{error}</p>
                {!error.includes("HTTPS") && (
                  <Button onClick={startScanner} size="sm">
                    Try Again
                  </Button>
                )}
                {error.includes("HTTPS") && (
                  <p className="text-white/60 text-xs text-center">
                    Use your phone&apos;s camera app instead, or access via HTTPS
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan frame overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner markers */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[230px] h-[230px]">
                {/* Top-left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                {/* Top-right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                {/* Bottom-left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                {/* Bottom-right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchCamera}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SwitchCamera className="h-4 w-4 mr-2" />
            Switch Camera
          </Button>
        </div>

        {/* Instructions */}
        <p className="mt-4 text-center text-white/60 text-sm">
          Point your camera at a QuickDrop QR code
        </p>
      </div>
    </motion.div>
  )
}
