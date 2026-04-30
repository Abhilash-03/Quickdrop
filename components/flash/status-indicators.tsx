"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface ConnectingSpinnerProps {
  icon: LucideIcon
  title: string
  subtitle?: string
}

export function ConnectingSpinner({ icon: Icon, title, subtitle }: ConnectingSpinnerProps) {
  return (
    <div className="text-center space-y-4">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

export function ConnectionIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-sm font-medium">Connected</span>
    </div>
  )
}

export function WaitingIndicator({ text = "Waiting..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-current"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}
