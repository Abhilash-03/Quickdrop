"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Calendar,
  Upload,
  Share2,
  Download,
  LogOut,
  Shield,
  Zap,
  Clock,
  ArrowLeft,
  Loader2,
  Settings,
  ChevronRight,
  BadgeCheck,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthModal } from "@/lib/auth-modal-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    provider: string | null
    createdAt: string
  }
  stats: {
    totalFiles: number
    totalShares: number
    activeShares: number
    totalDownloads: number
    todayUploads: number
    dailyLimit: number
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  gradient,
  delay = 0 
}: { 
  icon: React.ElementType
  label: string
  value: number | string
  gradient: string
  delay?: number
}) {
  return (
    <motion.div
      variants={statCardVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden"
    >
      <Card className="border-0 shadow-lg">
        <div className={`absolute inset-0 opacity-10 ${gradient}`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3, type: "spring" }}
                className="text-3xl font-bold"
              >
                {value}
              </motion.p>
            </div>
            <div className={`p-3 rounded-xl ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { openLogin } = useAuthModal()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/")
      openLogin()
    }
  }, [authStatus, router, openLogin])

  useEffect(() => {
    async function fetchProfile() {
      if (authStatus !== "authenticated") return

      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch {
        console.error("Failed to fetch profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [authStatus])

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (authStatus === "unauthenticated") {
    return null
  }

  const quotaPercentage = profile 
    ? (profile.stats.todayUploads / profile.stats.dailyLimit) * 100 
    : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Back button */}
          <motion.div variants={itemVariants}>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Left side - Avatar section */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 flex flex-col items-center justify-center sm:w-64">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                        <AvatarImage src={profile?.user.image || undefined} />
                        <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                          {profile?.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4"
                    >
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </motion.div>
                  </div>
                  
                  {/* Right side - Info section */}
                  <div className="flex-1 p-6 sm:p-8">
                    <div className="flex flex-col gap-4">
                      <div>
                        <motion.h1
                          className="text-2xl font-bold tracking-tight"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {profile?.user.name || "User"}
                        </motion.h1>
                        
                        <motion.div
                          className="flex items-center gap-2 text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{profile?.user.email}</span>
                        </motion.div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <motion.div
                        className="grid grid-cols-2 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Joined</p>
                            <p className="text-sm font-medium">
                              {profile ? formatDate(profile.user.createdAt) : "..."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Account</p>
                            <p className="text-sm font-medium capitalize">
                              {profile?.user.provider === "credentials" 
                                ? "Email" 
                                : profile?.user.provider || "Unknown"
                              }
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Your Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Upload}
                label="Total Uploads"
                value={profile?.stats.totalFiles || 0}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                delay={0}
              />
              <StatCard
                icon={Share2}
                label="Total Shares"
                value={profile?.stats.totalShares || 0}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                delay={0.1}
              />
              <StatCard
                icon={Clock}
                label="Active Links"
                value={profile?.stats.activeShares || 0}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
                delay={0.2}
              />
              <StatCard
                icon={Download}
                label="Total Downloads"
                value={profile?.stats.totalDownloads || 0}
                gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                delay={0.3}
              />
            </div>
          </motion.div>

          {/* Daily Quota */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Today's Usage
                </CardTitle>
                <CardDescription>
                  Your daily upload quota resets at midnight UTC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Uploads today</span>
                    <span className="font-medium">
                      {profile?.stats.todayUploads || 0} / {profile?.stats.dailyLimit || 20}
                    </span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    style={{ transformOrigin: "left" }}
                  >
                    <Progress value={quotaPercentage} className="h-3" />
                  </motion.div>
                  <p className="text-xs text-muted-foreground">
                    {profile && profile.stats.dailyLimit - profile.stats.todayUploads > 0
                      ? `${profile.stats.dailyLimit - profile.stats.todayUploads} uploads remaining today`
                      : "Daily limit reached. Try again tomorrow!"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Upload className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">My Files</p>
                        <p className="text-sm text-muted-foreground">Manage your shared files</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </motion.div>

                <Separator />

                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/history"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Clock className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Share History</p>
                        <p className="text-sm text-muted-foreground">View recent shares</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </motion.div>

                <Separator />

                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <LogOut className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-destructive">Sign Out</p>
                        <p className="text-sm text-muted-foreground">Log out of your account</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
