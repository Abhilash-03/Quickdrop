"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AxiosError } from "axios"
import { motion, AnimatePresence } from "framer-motion"
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
  Check,
  Shield,
  Sparkles,
  ArrowRight,
  Timer,
  CloudDownload
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

function formatTimeRemaining(expiresAt: string): { text: string; urgent: boolean } {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff <= 0) return { text: "Expired", urgent: true }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return { text: `${days}d ${hours % 24}h`, urgent: false }
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, urgent: hours < 2 }
  }
  return { text: `${minutes}m`, urgent: true }
}

// Animated background blobs
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border shadow-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-muted animate-pulse" />
            <div className="mt-4 w-48 h-6 bg-muted rounded-lg animate-pulse" />
            <div className="mt-2 w-24 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-24 h-6 bg-muted rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="w-full h-12 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

// Error/Not Found state
function ErrorState({ 
  icon: Icon, 
  title, 
  description, 
  iconBg 
}: { 
  icon: React.ElementType
  title: string
  description: string
  iconBg: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border shadow-2xl p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
        <div className="relative space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className={`w-20 h-20 mx-auto rounded-2xl ${iconBg} flex items-center justify-center`}
          >
            <Icon className="w-10 h-10" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/">
              <Upload className="w-4 h-4 mr-2" />
              Share Your Own File
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DownloadPage() {
  const params = useParams()
  const code = params.code as string

  const { data: linkInfo, isLoading, error } = useLinkInfo(code)

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

  const effectivePreviewUrl = linkInfo?.hasPassword ? verifiedPreviewUrl : linkInfo?.previewUrl

  const handlePreview = () => {
    if (effectivePreviewUrl) {
      window.open(effectivePreviewUrl, "_blank")
    }
  }

  const isExpired = (error as AxiosError)?.response?.status === 410
  const isNotFound = (error as AxiosError)?.response?.status === 404
  const hasError = error && !isExpired && !isNotFound

  const fileSupportsPreview = linkInfo?.mime.startsWith("image/") || linkInfo?.mime === "application/pdf"
  const canPreview = effectivePreviewUrl && fileSupportsPreview
  const isImage = linkInfo?.mime.startsWith("image/")
  const IconComponent = linkInfo ? getFileIcon(linkInfo.mime) : FileIcon
  const timeInfo = linkInfo ? formatTimeRemaining(linkInfo.expiresAt) : null

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      {/* Minimal Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Upload className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">QuickDrop</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pb-16">
        <AnimatePresence mode="wait">
          {isLoading && <LoadingSkeleton key="loading" />}

          {isNotFound && (
            <ErrorState
              key="not-found"
              icon={AlertCircle}
              iconBg="bg-muted text-muted-foreground"
              title="Link Not Found"
              description="This download link doesn't exist or may have been deleted."
            />
          )}

          {isExpired && (
            <ErrorState
              key="expired"
              icon={Timer}
              iconBg="bg-orange-500/10 text-orange-500"
              title="Link Expired"
              description="This download link has expired or reached its download limit."
            />
          )}

          {hasError && (
            <ErrorState
              key="error"
              icon={AlertCircle}
              iconBg="bg-destructive/10 text-destructive"
              title="Something Went Wrong"
              description="We couldn't load this file. Please try again later."
            />
          )}

          {linkInfo && !error && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                
                {/* Image Preview for images - blurred for privacy */}
                {isImage && effectivePreviewUrl && (
                  <div className="relative h-48 bg-muted/50 overflow-hidden group">
                    <Image
                      src={effectivePreviewUrl}
                      alt={linkInfo.filename}
                      fill
                      className="object-cover blur-sm scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-card/30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Download to view</span>
                    </div>
                  </div>
                )}

                <div className="relative p-8 space-y-6">
                  {/* File Icon & Name */}
                  <div className="flex flex-col items-center text-center">
                    {!isImage && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 ring-4 ring-primary/10"
                      >
                        <IconComponent className="w-10 h-10 text-primary" />
                      </motion.div>
                    )}
                    <h1 className="text-xl font-bold break-all leading-tight">
                      {linkInfo.filename}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatFileSize(linkInfo.size)}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge 
                      variant={timeInfo?.urgent ? "destructive" : "secondary"} 
                      className="gap-1.5 px-3 py-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {timeInfo?.text}
                    </Badge>
                    <Badge 
                      variant={linkInfo.downloadsRemaining <= 2 ? "destructive" : "secondary"}
                      className="gap-1.5 px-3 py-1"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      {linkInfo.downloadsRemaining} of {linkInfo.downloadLimit} left
                    </Badge>
                    {linkInfo.hasPassword && (
                      <Badge 
                        variant={isVerified ? "default" : "outline"} 
                        className="gap-1.5 px-3 py-1"
                      >
                        {isVerified ? (
                          <>
                            <Shield className="w-3.5 h-3.5" />
                            Unlocked
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Protected
                          </>
                        )}
                      </Badge>
                    )}
                  </div>

                  {/* Password Input */}
                  <AnimatePresence>
                    {linkInfo.hasPassword && !isVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Enter password to unlock"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
                            className={`pl-10 h-12 rounded-xl bg-muted/50 border-muted ${passwordError ? "border-destructive ring-destructive/20 ring-2" : ""}`}
                            disabled={isVerifying}
                          />
                        </div>
                        {passwordError && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-destructive text-center"
                          >
                            {passwordError}
                          </motion.p>
                        )}
                        <Button
                          className="w-full h-12 rounded-xl font-semibold"
                          onClick={verifyPassword}
                          disabled={isVerifying || !password.trim()}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Unlock File
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Download/Preview Buttons */}
                  <AnimatePresence>
                    {(!linkInfo.hasPassword || isVerified) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex gap-3">
                          {canPreview && (
                            <Button 
                              variant="outline"
                              className="flex-1 h-12 rounded-xl font-semibold" 
                              onClick={handlePreview}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                className={`${canPreview ? "flex-1" : "w-full"} h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary`}
                                disabled={isDownloading}
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-primary" />
                                  Ready to Download?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will use 1 of your {linkInfo.downloadsRemaining} remaining downloads. 
                                  The download counts once you confirm.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={download} className="rounded-xl">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Now
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Helper text */}
                        <p className="text-xs text-center text-muted-foreground">
                          {canPreview 
                            ? "Preview is free and doesn't count towards download limit"
                            : "File will auto-delete when limit is reached or link expires"
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Security badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Secure, encrypted file transfer</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline">
            QuickDrop
          </Link>
          {" "}• Fast & secure file sharing
        </p>
      </footer>
    </div>
  )
}
