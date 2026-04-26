"use client"

import { useCallback, useState } from "react"
import { useSession } from "next-auth/react"
import { Upload, FileIcon, X, Loader2 } from "lucide-react"
import { useUploadStore } from "@/lib/upload-store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
]

const MAX_SIZE_MB = 50

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const { data: session } = useSession()
  const {
    currentFile,
    expiresInHours,
    downloadLimit,
    setFile,
    setProgress,
    setStatus,
    setError,
    setShareUrl,
    setExpiresInHours,
    setDownloadLimit,
    reset,
  } = useUploadStore()

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "File type not supported. Use images, PDFs, or ZIP files."
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    setFile(file)
  }, [setFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  // Compute SHA-256 checksum
  async function computeChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

  const handleUpload = async () => {
    if (!currentFile) return

    try {
      setStatus("uploading")

      // 1. Get signed upload params
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mime: currentFile.file.type,
          size: currentFile.file.size,
        }),
      })

      if (!signRes.ok) {
        const err = await signRes.json()
        throw new Error(err.error || "Failed to get upload signature")
      }

      const { cloudName, apiKey, timestamp, folder, signature } = await signRes.json()

      // 2. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", currentFile.file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("folder", folder)
      formData.append("signature", signature)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setProgress(percent)
        }
      }

      const uploadResult = await new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error("Upload failed"))
          }
        }
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.send(formData)
      })

      setStatus("processing")

      // 3. Compute checksum
      const checksum = await computeChecksum(currentFile.file)

      // 4. Create share link
      const shareRes = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: currentFile.file.name,
          mime: currentFile.file.type,
          size: currentFile.file.size,
          secureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          expiresInHours,
          downloadLimit,
          checksum,
          isAnonymous: !session?.user,
        }),
      })

      if (!shareRes.ok) {
        const err = await shareRes.json()
        throw new Error(err.error || "Failed to create share link")
      }

      const { url } = await shareRes.json()
      setShareUrl(url)
      toast.success("File uploaded successfully!")

    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    }
  }

  // Render different states
  if (!currentFile) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
          ${isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 bg-muted/30"
          }
        `}
      >
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleInputChange}
          />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">
            {isDragging ? "Drop your file here" : "Drop files here or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Images, PDFs, and ZIP files up to {MAX_SIZE_MB}MB
          </p>
        </label>
      </div>
    )
  }

  // File selected - show preview and options
  return (
    <div className="border rounded-xl p-6 bg-card">
      {/* File info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{currentFile.file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {currentFile.status === "idle" && (
          <Button variant="ghost" size="icon" onClick={reset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Upload options */}
      {currentFile.status === "idle" && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Expires in</label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
                <option value={720}>30 days</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Download limit</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {(currentFile.status === "uploading" || currentFile.status === "processing") && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>{currentFile.status === "uploading" ? "Uploading..." : "Processing..."}</span>
            <span>{currentFile.progress}%</span>
          </div>
          <Progress value={currentFile.progress} />
        </div>
      )}

      {/* Error */}
      {currentFile.status === "error" && (
        <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {currentFile.error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {currentFile.status === "idle" && (
          <>
            <Button onClick={handleUpload} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Upload & Share
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </>
        )}
        
        {(currentFile.status === "uploading" || currentFile.status === "processing") && (
          <Button disabled className="flex-1">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {currentFile.status === "uploading" ? "Uploading..." : "Creating link..."}
          </Button>
        )}

        {currentFile.status === "error" && (
          <>
            <Button onClick={handleUpload} className="flex-1">
              Retry
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
