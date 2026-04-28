"use client"

import { useState, useEffect, useMemo } from "react"
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
  Download,
  ArrowLeft,
  FolderOpen,
  Search,
  Loader2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useUploadStore, type ShareHistoryItem } from "@/lib/upload-store"
import { useSyncHistory } from "@/hooks/use-sync-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return FileImage
  if (["pdf", "doc", "docx", "txt"].includes(ext || "")) return FileText
  if (["zip", "rar", "7z", "tar"].includes(ext || "")) return FileArchive
  return FileIcon
}

function getFileTypeLabel(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "Image"
  if (["pdf"].includes(ext || "")) return "PDF"
  if (["doc", "docx", "txt"].includes(ext || "")) return "Document"
  if (["zip", "rar", "7z", "tar"].includes(ext || "")) return "Archive"
  if (["mp4", "mov", "avi", "mkv"].includes(ext || "")) return "Video"
  if (["mp3", "wav", "flac"].includes(ext || "")) return "Audio"
  return ext?.toUpperCase() || "File"
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
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
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
  item, 
  onCopy, 
  onRemove, 
  copiedId 
}: {
  item: ShareHistoryItem
  onCopy: (id: string, url: string) => void
  onRemove: (id: string) => void
  copiedId: string | null
}) {
  const IconComponent = getFileIcon(item.filename)
  const isCopied = copiedId === item.id

  return (
    <motion.div
      layout
      variants={itemVariants}
      exit="exit"
      className="group"
    >
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-muted/50 transition-colors">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{item.filename}</p>
          <p className="text-xs text-muted-foreground">{getFileTypeLabel(item.filename)}</p>
        </div>
        
        <div className="hidden md:block w-20 text-sm text-muted-foreground text-right">
          {formatFileSize(item.size)}
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 w-28 text-sm text-muted-foreground">
          <Download className="h-3.5 w-3.5" />
          <span>{item.downloadLimit} left</span>
        </div>
        
        <div className="w-24 text-sm text-muted-foreground text-right">
          {formatTimeAgo(item.createdAt)}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCopy(item.id, item.shareUrl)}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <SocialShare 
            url={item.shareUrl}
            title={`Download ${item.filename} via QuickDrop`}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-3 px-2 py-3 rounded-xl active:bg-muted/50 transition-colors">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{item.filename}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatFileSize(item.size)}</span>
            <span className="opacity-40">•</span>
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onCopy(item.id, item.shareUrl)}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <SocialShare 
            url={item.shareUrl}
            title={`Download ${item.filename} via QuickDrop`}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { shareHistory, removeFromHistory, clearHistory } = useUploadStore()

  // Sync with server to remove expired/limit-reached items
  const { isLoading: isSyncing } = useSyncHistory(shareHistory)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const filteredHistory = useMemo(() => {
    // First filter out expired items
    const now = Date.now()
    const activeItems = shareHistory.filter(item => {
      const expiresAt = item.createdAt + (item.expiresInHours * 60 * 60 * 1000)
      return expiresAt > now
    })
    
    // Then apply search filter
    if (!searchQuery.trim()) return activeItems
    const query = searchQuery.toLowerCase()
    return activeItems.filter(item => 
      item.filename.toLowerCase().includes(query)
    )
  }, [shareHistory, searchQuery])

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
                <h1 className="text-xl sm:text-2xl font-semibold">History</h1>
                <p className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
                  {filteredHistory.length} active share{filteredHistory.length !== 1 ? "s" : ""}
                  {isSyncing && (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      syncing
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {filteredHistory.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Clear all</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {filteredHistory.length} items from your history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                      Clear all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </motion.div>

        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No active shares</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  {searchQuery ? "No files match your search." : "Files you share will appear here. Expired links are automatically removed."}
                </p>
                <Button asChild>
                  <Link href="/">Share a file</Link>
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
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0 focus-visible:ring-1 rounded-xl"
              />
            </div>

            {/* Table header - desktop only */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider border-b mb-1">
              <div className="w-10" />
              <div className="flex-1">Name</div>
              <div className="hidden md:block w-20 text-right">Size</div>
              <div className="hidden lg:block w-28">Downloads</div>
              <div className="w-24 text-right">Shared</div>
              <div className="w-[104px]" />
            </div>

            {/* File list */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No files match &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-transparent"
              >
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((item) => (
                    <FileRow
                      key={item.id}
                      item={item}
                      onCopy={handleCopy}
                      onRemove={handleRemove}
                      copiedId={copiedId}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
