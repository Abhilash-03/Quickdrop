"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Copy,
  Check,
  ExternalLink,
  Trash2,
  FileIcon,
  FileImage,
  FileText,
  FileArchive,
  Clock,
  Download,
  ArrowLeft,
  FolderOpen,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useUploadStore, type ShareHistoryItem } from "@/lib/upload-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return FileImage
  if (ext === "pdf") return FileText
  if (ext === "zip") return FileArchive
  return FileIcon
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function getExpirationText(hours: number): string {
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.2 },
  },
}

function ShareCard({ item, onCopy, onRemove, copiedId }: {
  item: ShareHistoryItem
  onCopy: (id: string, url: string) => void
  onRemove: (id: string) => void
  copiedId: string | null
}) {
  const IconComponent = getFileIcon(item.filename)

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* File icon with gradient background */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5"
            >
              <IconComponent className="h-6 w-6 text-primary" />
            </motion.div>

            {/* File info */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold truncate">{item.filename}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{formatFileSize(item.size)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.createdAt)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {item.downloadLimit} downloads
                </span>
              </div>
              
              {/* Share URL preview */}
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate text-xs bg-muted px-2 py-1 rounded font-mono">
                  {item.shareUrl}
                </code>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCopy(item.id, item.shareUrl)}
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Copy link</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(item.shareUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Open link</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Remove from history</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const { shareHistory, removeFromHistory, clearHistory } = useUploadStore()

  useEffect(() => {
    setHydrated(true)
  }, [])

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success("Link copied!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleRemove = (id: string) => {
    removeFromHistory(id)
    toast.success("Removed from history")
  }

  const handleClearAll = () => {
    clearHistory()
    toast.success("History cleared")
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button and header */}
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Share History</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-12">
            Your recently shared files are saved locally on this device.
          </p>
        </motion.div>

        {shareHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4"
                >
                  <FolderOpen className="h-8 w-8 text-primary" />
                </motion.div>
                <h2 className="text-xl font-semibold mb-2">No files shared yet</h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  When you upload and share files, they'll appear here for quick access.
                </p>
                <Button asChild>
                  <Link href="/">
                    Share your first file
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Actions bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm text-muted-foreground">
                {shareHistory.length} file{shareHistory.length !== 1 ? "s" : ""} in history
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {shareHistory.length} items from your share history. 
                      This action cannot be undone. Your actual shared files won't be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>

            {/* Share list */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {shareHistory.map((item) => (
                  <ShareCard
                    key={item.id}
                    item={item}
                    onCopy={handleCopy}
                    onRemove={handleRemove}
                    copiedId={copiedId}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
