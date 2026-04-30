"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileUploader } from "@/components/file-uploader"
import { ShareLinkDialog } from "@/components/share-link-dialog"
import { Shield, Clock, Zap, Upload, Link2, Trash2, Cloud, Send, ArrowRight, Users, Wifi, Globe, Lock, Smartphone, Server, FileCheck, Share2 } from "lucide-react"
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
  const [howItWorksTab, setHowItWorksTab] = useState<"drop" | "flash">("drop")

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
                Drop to cloud. Flash for P2P. Fast, secure, private.
              </motion.p>
            </motion.div>

            {/* Upload Area with Tabs */}
            <motion.div 
              variants={fadeInUp}
              className="w-full max-w-xl mt-4"
            >
              {/* Tab Switcher */}
              <div className="relative flex p-1.5 bg-muted/80 backdrop-blur-sm rounded-2xl mb-6 border border-border/30">
                {/* Sliding indicator */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-background rounded-xl shadow-md"
                  initial={false}
                  animate={{
                    x: activeTab === "drop" ? 0 : "100%"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => setActiveTab("drop")}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-colors duration-200",
                    activeTab === "drop"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Cloud className="h-5 w-5" />
                  <span>Drop</span>
                </button>
                <button
                  onClick={() => setActiveTab("flash")}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-colors duration-200",
                    activeTab === "flash"
                      ? "text-foreground"
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
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
                      <div className="relative bg-card/30 backdrop-blur-sm rounded-3xl border border-border/30 p-1">
                        <FileUploader />
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Images, PDFs, ZIPs up to 10MB • Auto-deletes after expiry
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
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
                      <div className="relative rounded-3xl p-8 bg-card/50 backdrop-blur-sm border border-border/50">
                        <div className="flex flex-col items-center text-center">
                          <motion.div 
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                          >
                            <Zap className="h-8 w-8 text-primary-foreground" />
                          </motion.div>
                          <h3 className="text-xl font-bold mb-2">Flash Transfer</h3>
                          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                            Send any file up to 1GB directly via P2P. No cloud, no limits on file types.
                          </p>
                          
                          <div className="grid gap-3 w-full max-w-xs">
                            <Link
                              href="/flash?mode=send"
                              className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                  <Send className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold">Send File</p>
                                  <p className="text-xs opacity-80">Get a code to share</p>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <Link
                              href="/flash?mode=receive"
                              className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80">
                                  <Wifi className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold">Receive File</p>
                                  <p className="text-xs text-muted-foreground">Enter sender&apos;s code</p>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flash features */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30">
                        <Zap className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                        <span className="text-muted-foreground font-medium">P2P Speed</span>
                      </div>
                      <div className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30">
                        <Shield className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                        <span className="text-muted-foreground font-medium">Encrypted</span>
                      </div>
                      <div className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30">
                        <Users className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                        <span className="text-muted-foreground font-medium">Direct</span>
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

        {/* Choose Your Method Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Choose Your Method</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Two ways to share, each perfect for different needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Drop Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="group relative p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                    <Cloud className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Drop</h3>
                    <p className="text-sm text-muted-foreground">Cloud Upload</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">Upload to cloud and share via link. Perfect for sharing with multiple people or when the recipient isn&apos;t online.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Images, PDFs, ZIPs supported</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>Share with anyone, anywhere</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Auto-expiring links</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Server className="h-4 w-4 text-primary" />
                    <span>Up to 10MB file size</span>
                  </li>
                </ul>
                <Link 
                  href="/?tab=drop"
                  onClick={() => setActiveTab("drop")}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Try Drop <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Flash Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="group relative p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                    <Zap className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Flash</h3>
                    <p className="text-sm text-muted-foreground">P2P Transfer</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">Direct device-to-device transfer. No cloud storage, maximum privacy. Share a code and transfer instantly.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Any file type supported</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Real-time P2P transfer</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>No server storage</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Server className="h-4 w-4 text-primary" />
                    <span>Up to 1GB file size</span>
                  </li>
                </ul>
                <Link 
                  href="/flash"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  Try Flash <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 border-t">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Simple steps for both sharing methods.
            </p>
          </motion.div>

          {/* Mobile Tab Switcher */}
          <div className="md:hidden mb-8">
            <div className="relative flex p-1.5 bg-muted/80 backdrop-blur-sm rounded-2xl border border-border/30 max-w-xs mx-auto">
              <motion.div
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-background rounded-xl shadow-md"
                initial={false}
                animate={{
                  x: howItWorksTab === "drop" ? 0 : "100%"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => setHowItWorksTab("drop")}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors duration-200",
                  howItWorksTab === "drop" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Cloud className="h-4 w-4" />
                <span>Drop</span>
              </button>
              <button
                onClick={() => setHowItWorksTab("flash")}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors duration-200",
                  howItWorksTab === "flash" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Zap className="h-4 w-4" />
                <span>Flash</span>
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              {howItWorksTab === "drop" && (
                <motion.div
                  key="drop-steps"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid gap-8">
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
                </motion.div>
              )}
              {howItWorksTab === "flash" && (
                <motion.div
                  key="flash-steps"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid gap-8">
                    <Step 
                      number={1}
                      icon={Send}
                      title="Select & Share"
                      description="Choose a file and get a unique 6-character code to share."
                    />
                    <Step 
                      number={2}
                      icon={Smartphone}
                      title="Enter Code"
                      description="Recipient enters the code on their device to connect."
                    />
                    <Step 
                      number={3}
                      icon={Share2}
                      title="Direct Transfer"
                      description="File transfers directly between devices. No cloud involved."
                      isLast
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Content - Show Both */}
          <div className="hidden md:block">
            {/* Drop Steps */}
            <div className="mb-16">
              <motion.h3 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-xl font-semibold text-center mb-8 flex items-center justify-center gap-2"
              >
                <Cloud className="h-5 w-5 text-primary" /> Drop (Cloud Upload)
              </motion.h3>
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
            </div>

            {/* Flash Steps */}
            <div>
              <motion.h3 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-xl font-semibold text-center mb-8 flex items-center justify-center gap-2"
              >
                <Zap className="h-5 w-5 text-primary" /> Flash (P2P Transfer)
              </motion.h3>
              <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                <Step 
                  number={1}
                  icon={Send}
                  title="Select & Share"
                  description="Choose a file and get a unique 6-character code to share."
                />
                <Step 
                  number={2}
                  icon={Smartphone}
                  title="Enter Code"
                  description="Recipient enters the code on their device to connect."
                />
                <Step 
                  number={3}
                  icon={Share2}
                  title="Direct Transfer"
                  description="File transfers directly between devices. No cloud involved."
                  isLast
                />
              </div>
            </div>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Whether cloud upload or P2P transfer, your files move at maximum speed."
              delay={0}
            />
            <FeatureCard
              icon={Lock}
              title="P2P Privacy"
              description="Flash transfers go directly between devices. Your files never touch our servers."
              delay={0.1}
            />
            <FeatureCard
              icon={Clock}
              title="Auto-Expiring Links"
              description="Drop links auto-delete after expiry. No lingering data, complete privacy."
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="End-to-End Secure"
              description="Encrypted transfers for both methods. No tracking, no ads, ever."
              delay={0.3}
            />
            <FeatureCard
              icon={Globe}
              title="Works Everywhere"
              description="Share globally with Drop links, or instantly with Flash when both are online."
              delay={0.4}
            />
            <FeatureCard
              icon={Users}
              title="No Sign-up Required"
              description="Start sharing immediately. No accounts, no friction, just files."
              delay={0.5}
            />
          </div>
        </section>
      </main>

      <Footer />
      <ShareLinkDialog />
    </div>
  )
}
