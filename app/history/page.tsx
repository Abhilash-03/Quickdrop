"use client"

import { useState, useEffect, useMemo } from "react"
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
  Search,
  Grid3X3,
  List,
  Filter,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useUploadStore, type ShareHistoryItem } from "@/lib/upload-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

function getFileColor(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return { bg: "bg-zinc-900 dark:bg-zinc-100", icon: "text-zinc-300 dark:text-zinc-600", border: "border-zinc-800 dark:border-zinc-200" }
  if (ext === "pdf") return { bg: "bg-zinc-900 dark:bg-zinc-100", icon: "text-zinc-300 dark:text-zinc-600", border: "border-zinc-800 dark:border-zinc-200" }
  if (ext === "zip") return { bg: "bg-zinc-900 dark:bg-zinc-100", icon: "text-zinc-300 dark:text-zinc-600", border: "border-zinc-800 dark:border-zinc-200" }
  return { bg: "bg-zinc-900 dark:bg-zinc-100", icon: "text-zinc-300 dark:text-zinc-600", border: "border-zinc-800 dark:border-zinc-200" }
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

function ShareCard({ item, onCopy, onRemove, copiedId, isGrid }: {
  item: ShareHistoryItem
  onCopy: (id: string, url: string) => void
  onRemove: (id: string) => void
  copiedId: string | null
  isGrid?: boolean
}) {
  const IconComponent = getFileIcon(item.filename)
  const colorClass = getFileColor(item.filename)

  if (isGrid) {
    return (
      <motion.div
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <Card className="group h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* File type header */}
            <div className={`${colorClass.bg} p-6 flex items-center justify-center border-b ${colorClass.border}`}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm border ${colorClass.border}`}
              >
                <IconComponent className={`h-8 w-8 ${colorClass.icon}`} />
              </motion.div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <p className="font-semibold truncate mb-1" title={item.filename}>
                {item.filename}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>{formatFileSize(item.size)}</span>
                <span>•</span>
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-auto">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Download className="h-3 w-3" />
                  {item.downloadLimit}
                </Badge>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 mt-4 pt-4 border-t">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => onCopy(item.id, item.shareUrl)}
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(item.shareUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ x: 4 }}
    >
      <Card className={`group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 overflow-hidden border-l-4 ${colorClass.border.replace('border-', 'border-l-')}`}>
        <CardContent className="p-0">
          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-4 p-4 sm:p-5">
              {/* File icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass.bg} border ${colorClass.border}`}
              >
                <IconComponent className={`h-6 w-6 ${colorClass.icon}`} />
              </motion.div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{item.filename}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-medium">{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTimeAgo(item.createdAt)}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="secondary" className="hidden sm:flex text-xs gap-1">
                    <Download className="h-3 w-3" />
                    {item.downloadLimit} downloads
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <TooltipProvider delayDuration={100}>
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

                <TooltipProvider delayDuration={100}>
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

                <TooltipProvider delayDuration={100}>
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function HistoryPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const { shareHistory, removeFromHistory, clearHistory } = useUploadStore()

  useEffect(() => {
    setHydrated(true)
  }, [])

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return shareHistory
    const query = searchQuery.toLowerCase()
    return shareHistory.filter(item => 
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent"
            />
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
        {/* Header with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                Share History
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your recently shared files, saved locally on this device
              </p>
            </div>
          </div>
        </motion.div>

        {shareHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotateZ: [0, 3, -3, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <FolderOpen className="h-10 w-10 text-primary" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">No files shared yet</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  When you upload and share files, they&apos;ll appear here for quick access to your share links.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/">
                      Share your first file
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Search and filters bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full bg-muted/50"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-full p-1">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive rounded-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all {shareHistory.length} items from your share history. 
                        This action cannot be undone. Your actual shared files won&apos;t be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90 rounded-full">
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>

            {/* Results count */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mb-4"
            >
              {filteredHistory.length === shareHistory.length 
                ? `${shareHistory.length} file${shareHistory.length !== 1 ? "s" : ""} in history`
                : `${filteredHistory.length} of ${shareHistory.length} files`
              }
            </motion.p>

            {/* Share list/grid */}
            {filteredHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No files match &quot;{searchQuery}&quot;</p>
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((item) => (
                    <ShareCard
                      key={item.id}
                      item={item}
                      onCopy={handleCopy}
                      onRemove={handleRemove}
                      copiedId={copiedId}
                      isGrid
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((item) => (
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
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
