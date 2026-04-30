"use client"

import {
  FileIcon,
  FileImage,
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  Check,
} from "lucide-react"

export function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage
  if (type.startsWith("video/")) return FileVideo
  if (type.startsWith("audio/")) return FileAudio
  if (type === "application/pdf") return FileText
  if (type.includes("zip") || type.includes("rar") || type.includes("tar")) return FileArchive
  return FileIcon
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

interface FilePreviewProps {
  file: { name: string; size: number; type: string }
  showCheck?: boolean
}

export function FilePreview({ file, showCheck = false }: FilePreviewProps) {
  const IconComponent = getFileIcon(file.type)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
        <IconComponent className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      {showCheck && <Check className="h-4 w-4 text-primary" />}
    </div>
  )
}
