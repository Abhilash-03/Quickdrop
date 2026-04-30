"use client"

import { useState } from "react"
import { Share2, Copy, Check, ExternalLink, QrCode } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { QRCodeDisplay } from "@/components/qr-code-popover"
import { toast } from "sonner"

// Custom icons for platforms not in react-share
const SlackIcon = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="#4A154B" />
    <path d="M26.5 33.5a3 3 0 1 1-3-3h3v3zm1.5 0a3 3 0 1 1 6 0v7.5a3 3 0 1 1-6 0v-7.5z" fill="#E01E5A" />
    <path d="M31 23.5a3 3 0 1 1 3-3v3h-3zm0 1.5a3 3 0 1 1 0 6h-7.5a3 3 0 1 1 0-6H31z" fill="#36C5F0" />
    <path d="M41 28a3 3 0 1 1 3 3h-3v-3zm-1.5 0a3 3 0 1 1-6 0v-7.5a3 3 0 1 1 6 0V28z" fill="#2EB67D" />
    <path d="M36.5 41a3 3 0 1 1-3 3v-3h3zm0-1.5a3 3 0 1 1 0-6H44a3 3 0 1 1 0 6h-7.5z" fill="#ECB22E" />
  </svg>
)

interface SocialShareProps {
  url: string
  title?: string
  filename?: string
  variant?: "ghost" | "outline" | "default"
  size?: "icon" | "sm" | "default"
  className?: string
}

const socialButtons = [
  { Button: WhatsappShareButton, Icon: WhatsappIcon, name: "WhatsApp" },
  { Button: TelegramShareButton, Icon: TelegramIcon, name: "Telegram" },
  { Button: TwitterShareButton, Icon: XIcon, name: "X" },
  { Button: FacebookShareButton, Icon: FacebookIcon, name: "Facebook" },
  { Button: RedditShareButton, Icon: RedditIcon, name: "Reddit" },
  { Button: LinkedinShareButton, Icon: LinkedinIcon, name: "LinkedIn" },
  { Button: EmailShareButton, Icon: EmailIcon, name: "Email" },
]

// Custom share buttons for platforms without react-share support
const customShareButtons = [
  { name: "Slack", Icon: SlackIcon, type: "url" as const },
]

export function SocialShare({ 
  url, 
  title = "Download file via QuickDrop",
  filename = "share",
  variant = "ghost",
  size = "icon",
  className,
}: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleCustomShare = async (platform: string, type: "url" | "copy") => {
    if (type === "url" && platform === "Slack") {
      const slackUrl = `https://slack.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
      window.open(slackUrl, "_blank", "noopener,noreferrer")
      setOpen(false)
    } else {
      // Copy to clipboard for Instagram and Quora
      try {
        await navigator.clipboard.writeText(url)
        toast.success(`Link copied! Paste it on ${platform}`)
        setOpen(false)
      } catch {
        toast.error("Failed to copy")
      }
    }
  }

  // Extract short code from URL for display
  const shortCode = url.split("/").pop() || url

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant={variant} size={size} className={className}>
                <Share2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Share link</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">Share Your File</DialogTitle>
        {/* Header with gradient */}
        <div className="relative bg-primary px-6 pt-8 pb-12 text-primary-foreground">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-primary-foreground/20"
          >
            <Share2 className="h-8 w-8" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center text-xl font-semibold mt-4"
          >
            Share Your File
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-primary-foreground/80 mt-1"
          >
            Send this link to anyone
          </motion.p>
          
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary-foreground/10" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-primary-foreground/10" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-6 relative">
          {/* Copy Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Share Link</p>
                  <p className="text-sm font-mono font-medium truncate">{shortCode}</p>
                </div>
                <Button 
                  variant={showQR ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setShowQR(!showQR)}
                  className="h-9 w-9 shrink-0"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>

              {/* QR Code section */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <QRCodeDisplay url={url} filename={filename} size={150} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  copied 
                    ? "bg-green-500 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Copied to Clipboard!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>

          {/* Share via text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center text-xs text-muted-foreground mt-5 mb-3"
          >
            Or share directly via
          </motion.p>

          {/* Social buttons grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-5 gap-3 sm:gap-2"
          >
            {socialButtons.map(({ Button: SocialButton, Icon, name }, index) => (
              <TooltipProvider key={name} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.35 + index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex justify-center"
                    >
                      <SocialButton 
                        url={url} 
                        title={title} 
                        onClick={() => setOpen(false)}
                        className="!rounded-xl overflow-hidden"
                      >
                        <Icon size={36} round />
                      </SocialButton>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {customShareButtons.map(({ name, Icon, type }, index) => (
              <TooltipProvider key={name} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.35 + (socialButtons.length + index) * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex justify-center cursor-pointer"
                      onClick={() => handleCustomShare(name, type)}
                    >
                      <Icon size={36} />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
