"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  FileIcon,
  FileImage,
  FileText,
  FileArchive,
  Loader2,
  Upload,
  Clock,
  Download
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthModal } from "@/lib/auth-modal-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

interface Share {
  id: string
  code: string
  filename: string
  mime: string
  size: number
  status: string
  downloadCount: number
  downloadLimit: number
  expiresAt: string
  createdAt: string
}

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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getStatusBadge(status: string, expiresAt: string) {
  const isExpired = new Date(expiresAt) <= new Date()
  
  if (status === "expired" || isExpired) {
    return <Badge variant="secondary">Expired</Badge>
  }
  if (status === "deleted") {
    return <Badge variant="destructive">Deleted</Badge>
  }
  return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { openLogin } = useAuthModal()
  const [shares, setShares] = useState<Share[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/")
      openLogin()
    }
  }, [authStatus, router, openLogin])

  useEffect(() => {
    async function fetchShares() {
      if (authStatus !== "authenticated") return
      
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const data = await res.json()
          setShares(data.shares)
        }
      } catch {
        toast.error("Failed to load your files")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchShares()
  }, [authStatus])

  const handleCopy = async (code: string) => {
    const url = `${window.location.origin}/d/${code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(code)
      toast.success("Link copied!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    
    try {
      const res = await fetch(`/api/share/${id}`, { method: "DELETE" })
      if (res.ok) {
        setShares(shares.filter(s => s.id !== id))
        toast.success("File deleted")
      } else {
        toast.error("Failed to delete file")
      }
    } catch {
      toast.error("Failed to delete file")
    }
  }

  if (authStatus === "loading" || (authStatus === "authenticated" && isLoading)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (authStatus === "unauthenticated") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your shared files</p>
          </div>
          <Button asChild>
            <Link href="/">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Link>
          </Button>
        </div>

        {shares.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No files yet</h2>
              <p className="text-muted-foreground mb-6">
                Upload your first file to get started.
              </p>
              <Button asChild>
                <Link href="/">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload a File
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {shares.map((share) => {
              const IconComponent = getFileIcon(share.mime)
              const isActive = share.status === "active" && new Date(share.expiresAt) > new Date()
              
              return (
                <Card key={share.id} className={!isActive ? "opacity-60" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* File icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    
                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{share.filename}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatFileSize(share.size)}</span>
                        <span>•</span>
                        <span>{formatDate(share.createdAt)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span>{share.downloadCount}/{share.downloadLimit}</span>
                          </TooltipTrigger>
                          <TooltipContent>Downloads</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(share.expiresAt)}</span>
                          </TooltipTrigger>
                          <TooltipContent>Expires on</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Status badge */}
                    <div className="hidden md:block">
                      {getStatusBadge(share.status, share.expiresAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(share.code)}
                                >
                                  {copiedId === share.code ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy link</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                >
                                  <Link href={`/d/${share.code}`} target="_blank">
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open link</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(share.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
