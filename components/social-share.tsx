"use client"

import { useState } from "react"
import { Share2, Copy, Check, ExternalLink } from "lucide-react"
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
import { toast } from "sonner"

interface SocialShareProps {
  url: string
  title?: string
  variant?: "ghost" | "outline" | "default"
  size?: "icon" | "sm" | "default"
  className?: string
}

const socialButtons = [
  { Button: WhatsappShareButton, Icon: WhatsappIcon, name: "WhatsApp", bg: "bg-[#25D366]" },
  { Button: TelegramShareButton, Icon: TelegramIcon, name: "Telegram", bg: "bg-[#0088cc]" },
  { Button: TwitterShareButton, Icon: XIcon, name: "X", bg: "bg-black dark:bg-white dark:invert" },
  { Button: FacebookShareButton, Icon: FacebookIcon, name: "Facebook", bg: "bg-[#1877F2]" },
  { Button: RedditShareButton, Icon: RedditIcon, name: "Reddit", bg: "bg-[#FF4500]" },
  { Button: LinkedinShareButton, Icon: LinkedinIcon, name: "LinkedIn", bg: "bg-[#0A66C2]" },
  { Button: EmailShareButton, Icon: EmailIcon, name: "Email", bg: "bg-[#EA4335]" },
]

export function SocialShare({ 
  url, 
  title = "Download file via QuickDrop",
  variant = "ghost",
  size = "icon",
  className,
}: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

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
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
              
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
            className="grid grid-cols-7 gap-2"
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
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
