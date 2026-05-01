"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Wifi, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QRScanner } from "./qr-scanner"

interface CodeInputProps {
  value: string
  onChange: (code: string) => void
  onSubmit: (code?: string) => void
  autoFocus?: boolean
}

export function CodeInput({ value, onChange, onSubmit, autoFocus = true }: CodeInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [showScanner, setShowScanner] = useState(false)
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    }
  }, [autoFocus])

  const handleInput = useCallback((index: number, inputValue: string) => {
    const char = inputValue.toUpperCase().slice(-1)
    const newCode = value.split("")
    newCode[index] = char
    onChange(newCode.join(""))
    
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }, [value, onChange])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "Enter" && value.length === 6) {
      onSubmit() // Uses state value for manual entry
    }
  }, [value, onSubmit])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
    onChange(pasted)
    if (pasted.length === 6) {
      inputsRef.current[5]?.focus()
    }
  }, [onChange])

  return (
    <motion.div 
      className="w-full max-w-sm space-y-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <motion.div 
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 backdrop-blur-sm mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          <Download className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Enter code</h2>
        <p className="text-muted-foreground">Get the 6-character code from sender</p>
      </div>

      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <motion.input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="text"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "w-12 h-16 text-center text-2xl font-mono font-bold rounded-xl border-2 bg-card/50 backdrop-blur-sm outline-none transition-all duration-200",
              "focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-card",
              value[i] ? "border-primary bg-card" : "border-border/50"
            )}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          className="h-12 px-4"
          onClick={() => setShowScanner(true)}
        >
          <ScanLine className="h-5 w-5" />
        </Button>
        <Button 
          className="flex-1 h-12 text-base font-semibold"
          size="lg"
          onClick={() => onSubmit()}
          disabled={value.length !== 6}
        >
          <Wifi className="h-5 w-5 mr-2" />
          Connect
        </Button>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={(code) => {
              console.log("QR Scanner returned code:", code)
              // Close scanner first
              setShowScanner(false)
              // Set the code value for display
              onChange(code)
              // Pass code directly to avoid stale closure issue
              onSubmit(code)
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
