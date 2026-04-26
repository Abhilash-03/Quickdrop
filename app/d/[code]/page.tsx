"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Download, 
  FileIcon, 
  Clock, 
  AlertCircle, 
  Loader2,
  FileImage,
  FileText,
  FileArchive,
  Upload
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LinkInfo {
  filename: string
  mime: string
  size: number
  expiresAt: string
  downloadsRemaining: number
  downloadLimit: number
}

type PageState = "loading" | "ready" | "expired" | "not-found" | "error"

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage
  if (mime === "application/pdf") return FileText
  if (mime === "application/zip") return FileArchive
  return FileIcon
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff <= 0) return "Expired"
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? "s" : ""} remaining`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  }
  return `${minutes} minutes remaining`
}

export default function DownloadPage() {
  const params = useParams()
  const code = params.code as string
  const [state, setState] = useState<PageState>("loading")
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function fetchLinkInfo() {
      try {
        const res = await fetch(`/api/link/${code}`)
        
        if (res.status === 404) {
          setState("not-found")
          return
        }
        
        if (res.status === 410) {
          setState("expired")
          return
        }
        
        if (!res.ok) {
          setState("error")
          return
        }
        
        const data = await res.json()
        setLinkInfo(data)
        setState("ready")
      } catch {
        setState("error")
      }
    }
    
    fetchLinkInfo()
  }, [code])

  const handleDownload = () => {
    setIsDownloading(true)
    window.location.href = `/download/${code}`
  }

  const IconComponent = linkInfo ? getFileIcon(linkInfo.mime) : FileIcon

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {state === "loading" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading file info...</p>
              </CardContent>
            </Card>
          )}

          {state === "not-found" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  This download link doesn&apos;t exist or may have been deleted.
                </p>
                <Button asChild>
                  <Link href="/">
                    <Upload className="h-4 w-4 mr-2" />
                    Share Your Own File
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {state === "expired" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 mb-4">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
                <p className="text-muted-foreground mb-6">
                  This download link has expired or reached its download limit.
                </p>
                <Button asChild>
                  <Link href="/">
                    <Upload className="h-4 w-4 mr-2" />
                    Share Your Own File
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {state === "error" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Something Went Wrong</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t load this file. Please try again later.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {state === "ready" && linkInfo && (
            <Card>
              <CardHeader className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="break-all">{linkInfo.filename}</CardTitle>
                <CardDescription>{formatFileSize(linkInfo.size)}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="flex justify-center gap-4">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(linkInfo.expiresAt)}
                  </Badge>
                  <Badge variant="secondary">
                    {linkInfo.downloadsRemaining}/{linkInfo.downloadLimit} downloads left
                  </Badge>
                </div>

                {/* Download button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting download...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </>
                  )}
                </Button>

                {/* Info text */}
                <p className="text-xs text-center text-muted-foreground">
                  File will be automatically deleted when download limit is reached or link expires.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
