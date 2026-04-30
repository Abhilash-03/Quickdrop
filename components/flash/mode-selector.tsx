"use client"

import { motion } from "framer-motion"
import { Send, Download, Zap, Shield, Globe, ChevronRight } from "lucide-react"

interface ModeSelectorProps {
  onSend: () => void
  onReceive: () => void
}

export function ModeSelector({ onSend, onReceive }: ModeSelectorProps) {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Hero */}
      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Zap className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Device to Device
        </h2>
        <p className="text-muted-foreground text-lg">Transfer files directly without cloud storage</p>
      </motion.div>

      {/* Options */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button onClick={onSend} className="w-full group">
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
              <Send className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-lg">Send a file</p>
              <p className="text-sm text-muted-foreground">Get a code to share with anyone</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </button>

        <button onClick={onReceive} className="w-full group">
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80 backdrop-blur-sm">
              <Download className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-lg">Receive a file</p>
              <p className="text-sm text-muted-foreground">Enter the sender&apos;s 6-digit code</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </button>
      </motion.div>

      {/* Features */}
      <motion.div 
        className="flex justify-center gap-10 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          { icon: Zap, label: "Fast", desc: "P2P Speed" },
          { icon: Shield, label: "Private", desc: "E2E Encrypted" },
          { icon: Globe, label: "Global", desc: "Any Network" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
