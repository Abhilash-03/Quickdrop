"use client"

import { motion } from "framer-motion"
import { formatFileSize } from "./file-preview"

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`
}

function formatTime(seconds: number): string {
  if (!seconds || seconds === Infinity) return "..."
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.ceil(seconds % 60)
  return `${mins}m ${secs}s`
}

interface TransferProgressProps {
  progress: {
    percentage: number
    bytesTransferred: number
    totalBytes: number
    speed: number
  }
  label?: string
}

export function TransferProgress({ progress, label = "Transferring..." }: TransferProgressProps) {
  const eta = progress.speed > 0 
    ? (progress.totalBytes - progress.bytesTransferred) / progress.speed 
    : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{progress.percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatFileSize(progress.bytesTransferred)} / {formatFileSize(progress.totalBytes)}</span>
        <span>{formatSpeed(progress.speed)} • {formatTime(eta)}</span>
      </div>
    </div>
  )
}
