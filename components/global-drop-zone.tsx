"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Upload } from "lucide-react"
import { useUploadStore } from "@/lib/upload-store"
import { toast } from "sonner"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
]

const MAX_SIZE_MB = 10

export function GlobalDropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const { setFile, currentFile } = useUploadStore()
  const pathname = usePathname()

  // Disable on Flash page - it has its own drop zone
  const isDisabled = pathname?.startsWith("/flash")

  const validateFile = useCallback((file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const isZip = ext === "zip" || file.type.includes("zip")
    const isPdf = ext === "pdf" || file.type === "application/pdf"
    const isImage =
      file.type.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")

    if (!ALLOWED_TYPES.includes(file.type) && !isZip && !isPdf && !isImage) {
      return "File type not supported. Use images, PDFs, or ZIP files."
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0

      // Skip if disabled (e.g., on Flash page)
      if (isDisabled) return

      // Don't accept if already has a file being processed
      if (currentFile && currentFile.status !== "idle") {
        toast.error("Please wait for current upload to finish")
        return
      }

      const file = e.dataTransfer?.files[0]
      if (file) {
        const error = validateFile(file)
        if (error) {
          toast.error(error)
          return
        }
        setFile(file)
        toast.success(`File "${file.name}" ready to upload`)
      }
    },
    [setFile, validateFile, currentFile, isDisabled]
  )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Skip if disabled (e.g., on Flash page)
    if (isDisabled) return

    dragCounter.current++
    
    // Check if it's a file being dragged
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragging(true)
    }
  }, [isDisabled])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    window.addEventListener("dragenter", handleDragEnter)
    window.addEventListener("dragleave", handleDragLeave)
    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("drop", handleDrop)

    return () => {
      window.removeEventListener("dragenter", handleDragEnter)
      window.removeEventListener("dragleave", handleDragLeave)
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("drop", handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <AnimatePresence>
      {isDragging && !isDisabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDrop(e.nativeEvent)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            // Only close if leaving the overlay entirely
            if (e.currentTarget === e.target) {
              setIsDragging(false)
              dragCounter.current = 0
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="border-2 border-dashed border-primary rounded-3xl p-16 bg-primary/5 text-center pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <Upload className="h-16 w-16 mx-auto text-primary mb-4" />
            </motion.div>
            <p className="text-2xl font-semibold text-primary">Drop your file here</p>
            <p className="text-muted-foreground mt-2">
              Images, PDFs, and ZIP files up to {MAX_SIZE_MB}MB
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
