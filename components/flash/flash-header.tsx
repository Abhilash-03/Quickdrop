"use client"

import Link from "next/link"
import { ArrowLeft, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FlashHeaderProps {
  title: string
  onBack?: () => void
  backHref?: string
  showEncrypted?: boolean
  rightAction?: React.ReactNode
}

export function FlashHeader({ 
  title, 
  onBack, 
  backHref, 
  showEncrypted = false,
  rightAction 
}: FlashHeaderProps) {
  return (
    <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        {backHref ? (
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href={backHref}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        ) : onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <h1 className="font-semibold text-lg">{title}</h1>
        <div className="flex-1" />
        {showEncrypted && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            <span>E2E Encrypted</span>
          </div>
        )}
        {rightAction}
      </div>
    </div>
  )
}
