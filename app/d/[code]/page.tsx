"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { AxiosError } from "axios"
import { 
  Download, 
  FileIcon, 
  Clock, 
  AlertCircle, 
  Loader2,
  FileImage,
  FileText,
  FileArchive,
  Upload,
  Eye,
  Lock,
  Unlock,
  Check
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useLinkInfo } from "@/hooks/use-link-info"
import { useDownload } from "@/hooks/use-download"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

  // Fetch link info
  const { data: linkInfo, isLoading, error } = useLinkInfo(code)

  // Download hook
  const {
    download,
    isDownloading,
    password,
    setPassword,
    passwordError,
    verifyPassword,
    isVerifying,
    isVerified,
    previewUrl: verifiedPreviewUrl,
  } = useDownload({
    code,
    filename: linkInfo?.filename || "download",
    hasPassword: linkInfo?.hasPassword || false,
  })

  // Use verified preview URL for password-protected links, otherwise use linkInfo's previewUrl
  const effectivePreviewUrl = linkInfo?.hasPassword ? verifiedPreviewUrl : linkInfo?.previewUrl

  const handlePreview = () => {
    if (effectivePreviewUrl) {
      window.open(effectivePreviewUrl, "_blank")
    }
  }

  // Determine page state
  const isExpired = (error as AxiosError)?.response?.status === 410
  const isNotFound = (error as AxiosError)?.response?.status === 404
  const hasError = error && !isExpired && !isNotFound

  // Check if file type supports preview (and preview URL is available or will be after verification)
  const fileSupportsPreview = linkInfo?.mime.startsWith("image/") || linkInfo?.mime === "application/pdf"
  const canPreview = effectivePreviewUrl && fileSupportsPreview
  const IconComponent = linkInfo ? getFileIcon(linkInfo.mime) : FileIcon

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading file info...</p>
              </CardContent>
            </Card>
          )}

          {isNotFound && (
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

          {isExpired && (
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

          {hasError && (
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

          {linkInfo && (
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
                <div className="flex justify-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(linkInfo.expiresAt)}
                  </Badge>
                  <Badge variant="secondary">
                    {linkInfo.downloadsRemaining}/{linkInfo.downloadLimit} downloads left
                  </Badge>
                  {linkInfo.hasPassword && (
                    <Badge variant={isVerified ? "default" : "outline"} className="gap-1">
                      {isVerified ? (
                        <>
                          <Check className="h-3 w-3" />
                          Unlocked
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Protected
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                {/* Password input for protected links - show only if not verified */}
                {linkInfo.hasPassword && !isVerified && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter password to unlock</label>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                        className={passwordError ? "border-destructive" : ""}
                        disabled={isVerifying}
                      />
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={verifyPassword}
                      disabled={isVerifying || !password.trim()}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Unlock File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Action buttons - show only if no password OR password verified */}
                {(!linkInfo.hasPassword || isVerified) && (
                  <div className="flex gap-3">
                    {canPreview && (
                      <Button 
                        variant="outline"
                        className="flex-1" 
                        size="lg"
                        onClick={handlePreview}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className={canPreview ? "flex-1" : "w-full"}
                          size="lg"
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Download</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will use 1 of {linkInfo.downloadsRemaining} remaining downloads. 
                            Once you confirm, the download will count even if you cancel the save dialog.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={download}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Now
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Info text */}
                <p className="text-xs text-center text-muted-foreground">
                  {linkInfo.hasPassword && !isVerified
                    ? "Enter the password to unlock and access this file."
                    : canPreview 
                      ? "Preview doesn't count towards download limit. Use Preview to view the file first."
                      : "File will be automatically deleted when download limit is reached or link expires."
                  }
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
