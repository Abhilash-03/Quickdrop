"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileUploader } from "@/components/file-uploader"
import { ShareLinkDialog } from "@/components/share-link-dialog"
import { Shield, Clock, Zap, Upload, Link2, Trash2, Cloud, Send, ArrowRight, Users, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Feature card component
function FeatureCard({ icon: Icon, title, description, delay }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-card border shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <motion.div 
        className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="h-7 w-7 text-primary" />
      </motion.div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Step component for How It Works
function Step({ number, icon: Icon, title, description, isLast }: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: number * 0.15 }}
      className="flex flex-col items-center text-center relative"
    >
      {/* Connector line */}
      {!isLast && (
        <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
      )}
      
      {/* Step number badge */}
      <motion.div 
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
        whileHover={{ scale: 1.05 }}
      >
        <Icon className="h-8 w-8" />
        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-primary text-sm font-bold text-primary">
          {number}
        </span>
      </motion.div>
      
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">{description}</p>
    </motion.div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"drop" | "flash">("drop")

  // Prevent drag events from affecting FileUploader when Flash tab is active
  useEffect(() => {
    if (activeTab !== "flash") return
    
    const preventDrag = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    
    document.addEventListener("dragover", preventDrag)
    document.addEventListener("drop", preventDrag)
    
    return () => {
      document.removeEventListener("dragover", preventDrag)
      document.removeEventListener("drop", preventDrag)
    }
  }, [activeTab])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-16 md:py-24">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div 
              className="absolute top-20 -left-32 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            />
          </div>

          <motion.div 
            className="flex flex-col items-center text-center gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Heading */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Share Files{" "}
                <span className="relative">
                  <span className="text-primary">Instantly</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1 rounded"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                </span>
              </h1>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto"
              >
                Upload, share, and auto-delete. Simple, fast, and secure file sharing 
                with expiring links. Get started in seconds.
              </motion.p>
            </motion.div>

            {/* Upload Area with Tabs */}
            <motion.div 
              variants={fadeInUp}
              className="w-full max-w-xl mt-4"
            >
              {/* Tab Switcher */}
              <div className="flex p-1 bg-muted rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab("drop")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    activeTab === "drop"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Cloud className="h-5 w-5" />
                  <span>Drop</span>
                </button>
                <button
                  onClick={() => setActiveTab("flash")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    activeTab === "flash"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Zap className="h-5 w-5" />
                  <span>Flash</span>
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "drop" && (
                  <motion.div
                    key="drop"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
                      <div className="relative">
                        <FileUploader />
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Upload to cloud • Get shareable link • Auto-deletes
                    </p>
                  </motion.div>
                )}

                {activeTab === "flash" && (
                  <motion.div
                    key="flash"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
                      <div className="relative border-2 border-dashed rounded-xl p-8 bg-card">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <Zap className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Flash Transfer</h3>
                          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                            Transfer files directly between devices. No cloud upload needed. Fast & private.
                          </p>
                          
                          <div className="grid gap-3 w-full max-w-xs">
                            <Link
                              href="/flash?mode=send"
                              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Send className="h-5 w-5" />
                                <div className="text-left">
                                  <p className="font-medium">Send File</p>
                                  <p className="text-xs opacity-80">Share with someone nearby</p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            
                            <Link
                              href="/flash?mode=receive"
                              className="flex items-center justify-between gap-3 p-4 rounded-xl border-2 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Wifi className="h-5 w-5 text-muted-foreground" />
                                <div className="text-left">
                                  <p className="font-medium">Receive File</p>
                                  <p className="text-xs text-muted-foreground">Enter code to receive</p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flash features */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <Zap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-muted-foreground">LAN Speed</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <Shield className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-muted-foreground">Encrypted</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-muted-foreground">Direct P2P</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Quick stats */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                End-to-end secure
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {activeTab === "drop" ? "10MB max" : "1GB max"}
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Share your files in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <Step 
              number={1}
              icon={Upload}
              title="Upload Your File"
              description="Drag & drop or click to select. Supports images, PDFs, and ZIP files."
            />
            <Step 
              number={2}
              icon={Link2}
              title="Get Share Link"
              description="Instantly generate a unique link with custom expiration settings."
            />
            <Step 
              number={3}
              icon={Trash2}
              title="Auto-Delete"
              description="Files are automatically deleted after expiry or download limit."
              isLast
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 border-t">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Why Choose QuickDrop?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built with privacy and simplicity in mind. Your files, your control.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Upload directly to CDN for instant sharing with anyone, anywhere in the world."
              delay={0}
            />
            <FeatureCard
              icon={Clock}
              title="Auto-Expiring Links"
              description="Set expiration time and download limits. Files auto-delete when done for complete privacy."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Anonymous uploads supported. No tracking, no ads, no selling your data. Ever."
              delay={0.2}
            />
          </div>
        </section>
      </main>

      <Footer />
      <ShareLinkDialog />
    </div>
  )
}
