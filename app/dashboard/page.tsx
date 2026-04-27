"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Copy, 
  Check, 
  Trash2, 
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
import { useDashboard, useDeleteShare, type Share } from "@/hooks/use-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { SocialShare } from "@/components/social-share"

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
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // React Query hooks
  const { data: shares = [], isLoading } = useDashboard(authStatus === "authenticated")
  const deleteShare = useDeleteShare()

  // Redirect unauthenticated users
  if (authStatus === "unauthenticated") {
    router.push("/")
    openLogin()
    return null
  }

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

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    deleteShare.mutate(id)
  }

  if (authStatus === "loading" || isLoading) {
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your shared files</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Link>
          </Button>
        </div>

        {shares.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileIcon className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No files yet</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">
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
          <div className="grid gap-3 sm:gap-4">
            {shares.map((share) => {
              const IconComponent = getFileIcon(share.mime)
              const isActive = share.status === "active" && new Date(share.expiresAt) > new Date()
              
              return (
                <Card key={share.id} className={!isActive ? "opacity-60" : ""}>
                  <CardContent className="p-3 sm:p-4">
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{share.filename}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatFileSize(share.size)} • {formatDate(share.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(share.status, share.expiresAt)}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {share.downloadCount}/{share.downloadLimit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(share.expiresAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isActive && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopy(share.code)}
                              >
                                {copiedId === share.code ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <SocialShare 
                                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/d/${share.code}`}
                                title={`Download ${share.filename} via QuickDrop`}
                              />
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(share.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{share.filename}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(share.size)}</span>
                          <span>•</span>
                          <span>{formatDate(share.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
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

                      {getStatusBadge(share.status, share.expiresAt)}

                      <div className="flex items-center gap-1">
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
                            
                            <SocialShare 
                              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/d/${share.code}`}
                              title={`Download ${share.filename} via QuickDrop`}
                            />
                          </>
                        )}
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(share.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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
