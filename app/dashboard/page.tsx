"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Copy, 
  Check, 
  Trash2, 
  FileIcon,
  FileImage,
  FileText,
  FileArchive,
  Upload,
  Download,
  ArrowLeft,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthModal } from "@/lib/auth-modal-store"
import { useDashboard, useDeleteShare, type Share } from "@/hooks/use-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SocialShare } from "@/components/social-share"
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
import { toast } from "sonner"

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage
  if (mime === "application/pdf") return FileText
  if (mime === "application/zip") return FileArchive
  return FileIcon
}

function getFileTypeLabel(mime: string) {
  if (mime.startsWith("image/")) return "Image"
  if (mime === "application/pdf") return "PDF"
  if (mime === "application/zip") return "Archive"
  if (mime.startsWith("video/")) return "Video"
  if (mime.startsWith("audio/")) return "Audio"
  return "File"
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
  })
}

function getStatus(status: string, expiresAt: string) {
  const isExpired = new Date(expiresAt) <= new Date()
  if (status === "expired" || isExpired) return "expired"
  if (status === "deleted") return "deleted"
  return "active"
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

function FileRow({ 
  share, 
  onCopy, 
  onDelete, 
  copiedId 
}: {
  share: Share
  onCopy: (code: string) => void
  onDelete: (id: string) => void
  copiedId: string | null
}) {
  const IconComponent = getFileIcon(share.mime)
  const status = getStatus(share.status, share.expiresAt)
  const isActive = status === "active"
  const isCopied = copiedId === share.code
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/d/${share.code}` : `/d/${share.code}`

  return (
    <motion.div
      layout
      variants={itemVariants}
      exit="exit"
      className={`group ${!isActive ? "opacity-50" : ""}`}
    >
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-muted/50 transition-colors">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{share.filename}</p>
          <p className="text-xs text-muted-foreground">{getFileTypeLabel(share.mime)}</p>
        </div>
        
        <div className="hidden md:block w-20 text-sm text-muted-foreground text-right">
          {formatFileSize(share.size)}
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 w-24 text-sm text-muted-foreground">
          <Download className="h-3.5 w-3.5" />
          <span>{share.downloadCount}/{share.downloadLimit}</span>
        </div>
        
        <div className="w-20 text-sm text-muted-foreground text-right">
          {formatDate(share.createdAt)}
        </div>

        <div className="w-16">
          {status === "active" && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
              Active
            </Badge>
          )}
          {status === "expired" && (
            <Badge variant="secondary" className="text-xs">
              Expired
            </Badge>
          )}
          {status === "deleted" && (
            <Badge variant="destructive" className="text-xs">
              Deleted
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onCopy(share.code)}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              
              <SocialShare 
                url={shareUrl}
                title={`Download ${share.filename} via QuickDrop`}
              />
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{share.filename}&quot; and invalidate its share link.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(share.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-3 px-2 py-3 rounded-xl active:bg-muted/50 transition-colors">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate text-sm">{share.filename}</p>
            {status === "active" && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatFileSize(share.size)}</span>
            <span className="opacity-40">•</span>
            <span>{share.downloadCount}/{share.downloadLimit} downloads</span>
          </div>
        </div>
        
        <div className="flex items-center">
          {isActive && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onCopy(share.code)}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              
              <SocialShare 
                url={shareUrl}
                title={`Download ${share.filename} via QuickDrop`}
              />
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{share.filename}&quot; and invalidate its share link.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(share.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { openLogin } = useAuthModal()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: shares = [], isLoading } = useDashboard(authStatus === "authenticated")
  const deleteShare = useDeleteShare()

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
    deleteShare.mutate(id)
  }

  const activeShares = shares.filter(s => getStatus(s.status, s.expiresAt) === "active")

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-lg">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">My Files</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {activeShares.length} active • {shares.length} total
                </p>
              </div>
            </div>
            
            <Button asChild size="sm">
              <Link href="/">
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        {shares.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No files yet</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Upload your first file to start sharing.
                </p>
                <Button asChild>
                  <Link href="/">Upload a file</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Table header - desktop only */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider border-b mb-1">
              <div className="w-10" />
              <div className="flex-1">Name</div>
              <div className="hidden md:block w-20 text-right">Size</div>
              <div className="hidden lg:block w-24">Downloads</div>
              <div className="w-20 text-right">Created</div>
              <div className="w-16">Status</div>
              <div className="w-[104px]" />
            </div>

            {/* File list */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {shares.map((share) => (
                  <FileRow
                    key={share.id}
                    share={share}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                    copiedId={copiedId}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
