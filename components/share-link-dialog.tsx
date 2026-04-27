"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, RefreshCw } from "lucide-react"
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
  EmailShareButton,
  EmailIcon,
  RedditShareButton,
  RedditIcon,
} from "react-share"
import { useUploadStore } from "@/lib/upload-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

export function ShareLinkDialog() {
  const [copied, setCopied] = useState(false)
  const { currentFile, expiresInHours, downloadLimit, reset } = useUploadStore()

  const isOpen = currentFile?.status === "success" && !!currentFile.shareUrl
  const shareUrl = currentFile?.shareUrl || ""
  const shareTitle = currentFile ? `Download ${currentFile.file.name} via QuickDrop` : "Download file via QuickDrop"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleClose = () => {
    reset()
    setCopied(false)
  }

  const handleShareAnother = () => {
    reset()
    setCopied(false)
  }

  // Format expiration text
  const getExpirationText = () => {
    if (expiresInHours < 24) return `${expiresInHours} hour${expiresInHours > 1 ? "s" : ""}`
    const days = Math.floor(expiresInHours / 24)
    return `${days} day${days > 1 ? "s" : ""}`
  }

  const socialButtons = [
    { Button: WhatsappShareButton, Icon: WhatsappIcon, name: "WhatsApp" },
    { Button: TelegramShareButton, Icon: TelegramIcon, name: "Telegram" },
    { Button: TwitterShareButton, Icon: XIcon, name: "X (Twitter)" },
    { Button: FacebookShareButton, Icon: FacebookIcon, name: "Facebook" },
    { Button: RedditShareButton, Icon: RedditIcon, name: "Reddit" },
    { Button: LinkedinShareButton, Icon: LinkedinIcon, name: "LinkedIn" },
    { Button: EmailShareButton, Icon: EmailIcon, name: "Email" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            File uploaded successfully!
          </DialogTitle>
          <DialogDescription>
            Share this link with anyone. It will expire in {getExpirationText()} or after {downloadLimit} download{downloadLimit > 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share link input */}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="font-mono text-sm"
            />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social share buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Share on</p>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <TooltipProvider delayDuration={100}>
                {socialButtons.map(({ Button: SocialButton, Icon, name }) => (
                  <Tooltip key={name}>
                    <TooltipTrigger asChild>
                      <div className="transition-transform hover:scale-110">
                        <SocialButton url={shareUrl} title={shareTitle}>
                          <Icon size={34} round />
                        </SocialButton>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{name}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* File info */}
          {currentFile && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium truncate">{currentFile.file.name}</p>
              <p className="text-muted-foreground">
                {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(shareUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Link
            </Button>
            <Button className="flex-1" onClick={handleShareAnother}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Share Another
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
