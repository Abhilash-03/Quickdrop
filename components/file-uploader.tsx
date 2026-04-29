"use client"

import { useCallback, useState } from "react"
import { Upload, FileIcon, X, Loader2, Lock } from "lucide-react"
import { useUploadStore } from "@/lib/upload-store"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useQuota } from "@/hooks/use-quota"
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
  "application/x-zip-compressed",
  "application/x-zip",
]

const MAX_SIZE_MB = 10 // Cloudinary free tier limit

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    currentFile,
    expiresInHours,
    downloadLimit,
    password,
    setFile,
    setExpiresInHours,
    setDownloadLimit,
    setPassword,
    reset,
  } = useUploadStore()

  const { upload, isUploading } = useFileUpload()
  const { data: quota } = useQuota()

  const validateFile = (file: File): string | null => {
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
  }

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }
      setFile(file)
    },
    [setFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleUpload = () => {
    upload()
  }

  // Render different states
  if (!currentFile) {
    return (
      <div className="space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 bg-muted/30"
            }
          `}
        >
          <label className="cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip,image/*,application/pdf,application/zip"
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
        {quota && (
          <p className="text-center text-sm text-muted-foreground">
            {quota.remaining}/{quota.limit} uploads remaining today
            {quota.isAnonymous && " • Sign in for more"}
          </p>
        )}
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
      { (
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
                value={downloadLimit || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value)
                  setDownloadLimit(val)
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value)
                  if (!val || val < 1) setDownloadLimit(1)
                  else if (val > 100) setDownloadLimit(100)
                }}
              />
            </div>
          </div>
          
          {/* Password protection */}
          <div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="h-4 w-4" />
              {showPassword ? "Remove password protection" : "Add password protection (optional)"}
            </button>
            {showPassword && (
              <div className="mt-2">
                <Input
                  type="password"
                  placeholder="Enter password for this link"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1 text-left">
                  Recipients will need this password to download
                </p>
              </div>
            )}
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
            <Button onClick={handleUpload} className="flex-1" disabled={isUploading}>
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
