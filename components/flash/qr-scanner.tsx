"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, SwitchCamera, Loader2 } from "lucide-react"
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

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode")
      
      // Clean up previous instance
      if (html5QrcodeRef.current) {
        try {
          await html5QrcodeRef.current.stop()
        } catch {
          // Ignore cleanup errors
        }
      }

      const scanner = new Html5Qrcode("qr-reader")
      html5QrcodeRef.current = scanner

      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          // Extract room code from URL or use directly
          let code = decodedText
          
          // Handle full URLs like https://quickdrop.app/flash?code=ABC123
          if (decodedText.includes("code=")) {
            const match = decodedText.match(/code=([A-Z0-9]{6})/i)
            if (match) {
              code = match[1].toUpperCase()
            }
          } else if (/^[A-Z0-9]{6}$/i.test(decodedText)) {
            // Direct 6-character code
            code = decodedText.toUpperCase()
          } else {
            return // Invalid format, keep scanning
          }

          // Success - stop scanner and return code
          scanner.stop().then(() => {
            onScan(code)
          }).catch(() => {
            onScan(code)
          })
        },
        () => {
          // QR code not found in frame, keep scanning
        }
      )

      setIsLoading(false)
    } catch (err) {
      console.error("QR Scanner error:", err)
      setIsLoading(false)
      
      if (err instanceof Error) {
        if (err.message.includes("Permission")) {
          setError("Camera permission denied. Please allow camera access.")
        } else if (err.message.includes("NotFoundError") || err.message.includes("no camera")) {
          setError("No camera found on this device.")
        } else {
          setError("Failed to start camera. Try again.")
        }
      } else {
        setError("Failed to start camera. Try again.")
      }
    }
  }, [facingMode, onScan])

  // Start scanner on mount and when facing mode changes
  useEffect(() => {
    startScanner()

    return () => {
      // Cleanup on unmount
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {})
      }
    }
  }, [startScanner])

  const handleSwitchCamera = async () => {
    // Stop current scanner before switching
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
      } catch {
        // Ignore stop errors
      }
    }
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
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
          onClick={onClose}
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
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-white/80 text-sm text-center mb-4">{error}</p>
                <Button onClick={startScanner} size="sm">
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan frame overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner markers */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px]">
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
