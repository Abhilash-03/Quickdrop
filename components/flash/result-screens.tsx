"use client"

import { motion } from "framer-motion"
import { Check, X, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "./file-preview"

interface SuccessResultProps {
  title: string
  subtitle?: string
  file?: { name: string; size: number }
  onPrimaryAction: () => void
  primaryLabel: string
  onSecondaryAction?: () => void
  secondaryLabel?: string
}

export function SuccessResult({ 
  title, 
  subtitle, 
  file,
  onPrimaryAction, 
  primaryLabel,
  onSecondaryAction,
  secondaryLabel
}: SuccessResultProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div 
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Check className="h-10 w-10 text-primary" />
      </motion.div>
      <div>
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        {file ? (
          <>
            <p className="text-muted-foreground truncate max-w-[240px] mx-auto">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
          </>
        ) : subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        {onSecondaryAction && secondaryLabel && (
          <Button variant="outline" onClick={onSecondaryAction}>
            <Download className="h-4 w-4 mr-2" />
            {secondaryLabel}
          </Button>
        )}
        <Button onClick={onPrimaryAction}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}

interface ErrorResultProps {
  title: string
  message?: string
  onRetry: () => void
}

export function ErrorResult({ title, message, onRetry }: ErrorResultProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mx-auto">
        <X className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {message || "Something went wrong. Please try again."}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}
