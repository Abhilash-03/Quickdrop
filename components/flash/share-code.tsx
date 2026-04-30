"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ShareCodeProps {
  code: string
  shareUrl: string
}

export function ShareCode({ code, shareUrl }: ShareCodeProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-4">
        <p className="text-muted-foreground font-medium">Share this code</p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex gap-1.5 p-2 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            {code.split("").map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                className="w-12 h-14 flex items-center justify-center rounded-xl bg-muted/80 text-2xl font-mono font-bold"
              >
                {char}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              size="icon" 
              variant={copied ? "default" : "outline"} 
              onClick={handleCopy} 
              className="h-14 w-12 rounded-xl"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowQR(!showQR)}
          className="text-muted-foreground hover:text-foreground"
        >
          <QrCode className="h-4 w-4 mr-2" />
          {showQR ? "Hide" : "Show"} QR Code
        </Button>
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG value={shareUrl} size={160} level="H" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
