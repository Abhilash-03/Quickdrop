"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Download,
  Wifi,
  QrCode,
  Copy,
  Check,
  FileIcon,
  FileImage,
  FileText,
  FileArchive,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Users,
  Zap,
  Shield,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useP2P } from "@/hooks/use-p2p"
import { toast } from "sonner"

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage
  if (type === "application/pdf") return FileText
  if (type === "application/zip") return FileArchive
  return FileIcon
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`
}

type Mode = "select" | "send" | "receive"

export default function P2PSharePage() {
  const [mode, setMode] = useState<Mode>("select")
  const [joinCode, setJoinCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    role,
    roomCode,
    file,
    progress,
    error,
    initSender,
    initReceiver,
    downloadFile,
    reset,
  } = useP2P()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      initSender(selectedFile)
    }
  }, [initSender])

  const handleJoinRoom = useCallback(() => {
    if (joinCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-character code")
      return
    }
    initReceiver(joinCode.trim())
  }, [joinCode, initReceiver])

  const handleCopyCode = async () => {
    if (!roomCode) return
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      toast.success("Code copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleReset = () => {
    reset()
    setMode("select")
    setJoinCode("")
    setShowQR(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const shareUrl = typeof window !== "undefined" && roomCode 
    ? `${window.location.origin}/p2p?code=${roomCode}`
    : ""

  const IconComponent = file ? getFileIcon(file.type) : FileIcon

  // Auto-join if code is in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      if (code && code.length === 6) {
        setJoinCode(code)
        setMode("receive")
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-lg">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wifi className="h-6 w-6 text-primary" />
                Nearby Share
              </h1>
              <p className="text-sm text-muted-foreground">
                Fast P2P file transfer - no upload needed
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Direct P2P
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Encrypted
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              No account needed
            </Badge>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {mode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setMode("send")}
              >
                <CardHeader className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Send File</CardTitle>
                  <CardDescription>
                    Share a file with someone nearby
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setMode("receive")}
              >
                <CardHeader className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-2">
                    <Download className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle>Receive File</CardTitle>
                  <CardDescription>
                    Enter a code to receive a file
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Send Mode */}
          {mode === "send" && (
            <motion.div
              key="send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send File
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Selection */}
                  {status === "idle" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium">Click to select a file</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Any file type up to 1GB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Connecting */}
                  {status === "connecting" && (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Setting up connection...</p>
                    </div>
                  )}

                  {/* Waiting for receiver */}
                  {status === "waiting" && roomCode && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Share this code with the receiver
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-4xl font-mono font-bold tracking-widest bg-muted px-6 py-3 rounded-xl">
                            {roomCode}
                          </div>
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={handleCopyCode}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* QR Code toggle */}
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowQR(!showQR)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          {showQR ? "Hide QR" : "Show QR Code"}
                        </Button>
                      </div>

                      {showQR && (
                        <div className="flex justify-center">
                          <div className="bg-white p-4 rounded-xl">
                            <QRCodeSVG
                              value={shareUrl}
                              size={180}
                              level="H"
                              includeMargin
                            />
                          </div>
                        </div>
                      )}

                      {/* File info */}
                      {file && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Waiting for receiver to connect...</span>
                      </div>
                    </div>
                  )}

                  {/* Connected / Transferring */}
                  {(status === "connected" || status === "transferring") && (
                    <div className="space-y-6">
                      {file && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {status === "connected" && !progress && (
                        <div className="text-center py-4">
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Connected
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Starting transfer...
                          </p>
                        </div>
                      )}

                      {progress && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Sending...</span>
                            <span>{progress.percentage}%</span>
                          </div>
                          <Progress value={progress.percentage} className="h-3" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {formatFileSize(progress.bytesTransferred)} / {formatFileSize(progress.totalBytes)}
                            </span>
                            <span>{formatSpeed(progress.speed)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed */}
                  {status === "completed" && (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Transfer Complete!</h3>
                      <p className="text-muted-foreground mb-6">
                        File sent successfully
                      </p>
                      <Button onClick={handleReset}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Send Another
                      </Button>
                    </div>
                  )}

                  {/* Error */}
                  {status === "error" && (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
                        <FileIcon className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Error</h3>
                      <p className="text-muted-foreground mb-6">
                        {error || "Could not establish connection"}
                      </p>
                      <Button onClick={handleReset} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Back button for non-idle states */}
                  {status !== "idle" && status !== "completed" && status !== "error" && (
                    <Button variant="ghost" onClick={handleReset} className="w-full">
                      Cancel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Receive Mode */}
          {mode === "receive" && (
            <motion.div
              key="receive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Receive File
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enter code */}
                  {status === "idle" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Enter the 6-character code
                        </label>
                        <Input
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                          placeholder="ABC123"
                          className="text-center text-2xl font-mono tracking-widest h-14"
                          maxLength={6}
                          onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleJoinRoom}
                        disabled={joinCode.length !== 6}
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  )}

                  {/* Connecting */}
                  {status === "connecting" && (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Connecting to sender...</p>
                    </div>
                  )}

                  {/* Connected / Transferring */}
                  {(status === "connected" || status === "transferring") && (
                    <div className="space-y-6">
                      {file && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {status === "connected" && !progress && (
                        <div className="text-center py-4">
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Connected
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Waiting for file...
                          </p>
                        </div>
                      )}

                      {progress && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Receiving...</span>
                            <span>{progress.percentage}%</span>
                          </div>
                          <Progress value={progress.percentage} className="h-3" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {formatFileSize(progress.bytesTransferred)} / {formatFileSize(progress.totalBytes)}
                            </span>
                            <span>{formatSpeed(progress.speed)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed */}
                  {status === "completed" && file && (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">File Saved!</h3>
                      <p className="text-muted-foreground mb-2">{file.name}</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        {formatFileSize(file.size)} • Check your downloads folder
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={downloadFile}>
                          <Download className="h-4 w-4 mr-2" />
                          Save Again
                        </Button>
                        <Button onClick={handleReset}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Receive Another
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {status === "error" && (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
                        <FileIcon className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Error</h3>
                      <p className="text-muted-foreground mb-6">
                        {error || "Could not connect to sender. Check the code and try again."}
                      </p>
                      <Button onClick={handleReset} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Back button */}
                  {status === "idle" && (
                    <Button variant="ghost" onClick={() => setMode("select")} className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}

                  {status !== "idle" && status !== "completed" && status !== "error" && (
                    <Button variant="ghost" onClick={handleReset} className="w-full">
                      Cancel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {mode === "select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm font-medium">Sender selects file</p>
                    <p className="text-xs text-muted-foreground">Gets a 6-digit code</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm font-medium">Receiver enters code</p>
                    <p className="text-xs text-muted-foreground">Connects directly</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm font-medium">File transfers</p>
                    <p className="text-xs text-muted-foreground">P2P at LAN speed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
