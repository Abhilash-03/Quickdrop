"use client"

import { useRef, useCallback, useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  maxSizeLabel?: string
}

export function FileDropZone({ onFileSelect, maxSizeLabel = "1GB" }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  return (
    <motion.div 
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300",
          "bg-card/30 backdrop-blur-sm",
          isDragging 
            ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/10" 
            : "border-border/50 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
        )}
      >
        {/* Decorative gradient behind icon */}
        <div className={cn(
          "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/5 via-transparent to-primary/5",
          isDragging && "opacity-100"
        )} />
        
        <div className="relative flex flex-col items-center">
          <motion.div 
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl mb-6 transition-all duration-300",
              isDragging 
                ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25" 
                : "bg-muted/80"
            )}
            animate={isDragging ? { y: [-4, 4, -4] } : { y: 0 }}
            transition={{ duration: 1.5, repeat: isDragging ? Infinity : 0, ease: "easeInOut" }}
          >
            {isDragging ? (
              <FileUp className="h-9 w-9 text-primary-foreground" />
            ) : (
              <Upload className="h-9 w-9 text-muted-foreground" />
            )}
          </motion.div>
          <p className={cn(
            "text-xl font-semibold mb-2 transition-colors",
            isDragging ? "text-primary" : "text-foreground"
          )}>
            {isDragging ? "Drop to send" : "Choose a file"}
          </p>
          <p className="text-muted-foreground">
            Drag & drop or click to browse
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4">
            Maximum file size: {maxSizeLabel}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
