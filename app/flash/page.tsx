"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Radio, Wifi, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useP2P } from "@/hooks/use-p2p"
import {
  FlashHeader,
  FilePreview,
  TransferProgress,
  ConnectingSpinner,
  ConnectionIndicator,
  WaitingIndicator,
  SuccessResult,
  ErrorResult,
  ModeSelector,
  FileDropZone,
  ShareCode,
  CodeInput,
} from "@/components/flash"

type Mode = "select" | "send" | "receive"

// Animated background orbs
function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      
      {/* Animated orbs */}
      <motion.div 
        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute -bottom-20 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          y: [0, -30, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col relative">
      <GradientBackground />
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    </div>
  )
}

function FlashTransferContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>("select")
  const [joinCode, setJoinCode] = useState("")

  const {
    status,
    roomCode,
    file,
    progress,
    error,
    initSender,
    initReceiver,
    downloadFile,
    reset,
  } = useP2P()

  useEffect(() => {
    const urlMode = searchParams.get("mode")
    const code = searchParams.get("code")
    
    if (code && code.length === 6) {
      setJoinCode(code.toUpperCase())
      setMode("receive")
    } else if (urlMode === "send") {
      setMode("send")
    } else if (urlMode === "receive") {
      setMode("receive")
    }
  }, [searchParams])

  const handleBack = () => {
    reset()
    setMode("select")
    setJoinCode("")
  }

  const shareUrl = typeof window !== "undefined" && roomCode 
    ? `${window.location.origin}/flash?code=${roomCode}`
    : ""

  const showCancel = status !== "idle" && status !== "completed" && status !== "error"

  return (
    <div className="flex min-h-screen flex-col relative">
      <GradientBackground />
      <Header />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {mode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <FlashHeader title="Flash Transfer" backHref="/" showEncrypted />
              <div className="flex-1 flex items-center justify-center p-6">
                <ModeSelector 
                  onSend={() => { reset(); setMode("send") }}
                  onReceive={() => { reset(); setMode("receive") }}
                />
              </div>
            </motion.div>
          )}

          {/* Send Mode */}
          {mode === "send" && (
            <motion.div
              key="send"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <FlashHeader 
                title="Send File" 
                onBack={handleBack}
                rightAction={showCancel && <Button variant="ghost" size="sm" onClick={handleBack}>Cancel</Button>}
              />
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {status === "idle" && <FileDropZone onFileSelect={initSender} />}
                {status === "connecting" && <ConnectingSpinner icon={Radio} title="Creating room..." subtitle="Setting up secure connection" />}
                {status === "waiting" && roomCode && (
                  <div className="w-full max-w-sm space-y-6">
                    {file && <FilePreview file={file} showCheck />}
                    <ShareCode code={roomCode} shareUrl={shareUrl} />
                    <WaitingIndicator text="Waiting for receiver" />
                  </div>
                )}
                {(status === "connected" || status === "transferring") && (
                  <div className="w-full max-w-sm space-y-6">
                    <ConnectionIndicator />
                    {file && <FilePreview file={file} />}
                    {progress && <TransferProgress progress={progress} label="Sending..." />}
                  </div>
                )}
                {status === "completed" && <SuccessResult title="Transfer Complete" subtitle="File delivered successfully" onPrimaryAction={handleBack} primaryLabel="Send Another" />}
                {status === "error" && <ErrorResult title="Transfer Failed" message={error || "Connection could not be established"} onRetry={handleBack} />}
              </div>
            </motion.div>
          )}

          {/* Receive Mode */}
          {mode === "receive" && (
            <motion.div
              key="receive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <FlashHeader 
                title="Receive File" 
                onBack={handleBack}
                rightAction={showCancel && <Button variant="ghost" size="sm" onClick={handleBack}>Cancel</Button>}
              />
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {status === "idle" && <CodeInput value={joinCode} onChange={setJoinCode} onSubmit={() => initReceiver(joinCode.trim())} />}
                {status === "connecting" && <ConnectingSpinner icon={Wifi} title="Connecting..." subtitle={`Code: ${joinCode}`} />}
                {(status === "connected" || status === "transferring") && (
                  <div className="w-full max-w-sm space-y-6">
                    <ConnectionIndicator />
                    {file && <FilePreview file={file} />}
                    {status === "connected" && !progress && <p className="text-center text-sm text-muted-foreground">Waiting for file transfer...</p>}
                    {progress && <TransferProgress progress={progress} label="Receiving..." />}
                  </div>
                )}
                {status === "completed" && file && <SuccessResult title="File Received" file={file} onPrimaryAction={handleBack} primaryLabel="Receive Another" onSecondaryAction={downloadFile} secondaryLabel="Save Again" />}
                {status === "error" && <ErrorResult title="Connection Failed" message={error || "Could not connect. Check the code and try again."} onRetry={handleBack} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function FlashTransferPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FlashTransferContent />
    </Suspense>
  )
}
