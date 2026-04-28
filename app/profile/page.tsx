"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
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
  TrendingUp,
  Activity,
  KeyRound,
  Trash2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthModal } from "@/lib/auth-modal-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    provider: string | null
    hasPassword: boolean
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
  color,
  delay = 0 
}: { 
  icon: React.ElementType
  label: string
  value: number | string
  color: string
  delay?: number
}) {
  return (
    <motion.div
      variants={statCardVariants}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 h-full">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-zinc-100`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 dark:text-zinc-600`} />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3, type: "spring" }}
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="text-xl sm:text-3xl font-bold tracking-tight"
          >
            {value}
          </motion.p>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{label}</p>
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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

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

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
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
            <Card className="relative overflow-hidden border shadow-xl">
              {/* Gradient mesh background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-2xl" />
              
              <CardContent className="p-0 relative">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
                    {/* Avatar section */}
                    <div className="flex flex-col items-center sm:items-start">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="relative"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-primary/20 rounded-full blur-sm" />
                        <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-4 border-background shadow-xl relative">
                          <AvatarImage src={profile?.user.image || undefined} />
                          <AvatarFallback className="text-xl sm:text-3xl font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900">
                            {profile?.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 sm:p-1 border-2 border-background"
                        >
                          <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </motion.div>
                      </motion.div>
                    </div>
                    
                    {/* Info section */}
                    <div className="flex-1 text-center sm:text-left">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                          {profile?.user.name || "User"}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1 sm:mt-2">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{profile?.user.email}</span>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3 sm:mt-4"
                      >
                        <Badge variant="secondary" className="rounded-full px-2 sm:px-3 py-0.5 sm:py-1 gap-1 sm:gap-1.5 text-xs">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Joined {profile ? formatDate(profile.user.createdAt) : "..."}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-0.5 sm:py-1 gap-1 sm:gap-1.5 text-xs capitalize">
                          <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {profile?.user.provider === "credentials" 
                            ? "Email" 
                            : profile?.user.provider || "Unknown"
                          }
                        </Badge>
                      </motion.div>

                      {/* Mini stats row */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50"
                      >
                        <div className="text-center sm:text-left">
                          <p className="text-lg sm:text-2xl font-bold">{profile?.stats.totalFiles || 0}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Uploads</p>
                        </div>
                        <Separator orientation="vertical" className="h-8 sm:h-10" />
                        <div className="text-center sm:text-left">
                          <p className="text-lg sm:text-2xl font-bold">{profile?.stats.activeShares || 0}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
                        </div>
                        <Separator orientation="vertical" className="h-8 sm:h-10" />
                        <div className="text-center sm:text-left">
                          <p className="text-lg sm:text-2xl font-bold">{profile?.stats.totalDownloads || 0}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Downloads</p>
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
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Activity Overview
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                icon={Upload}
                label="Total Uploads"
                value={profile?.stats.totalFiles || 0}
                color="blue"
                delay={0}
              />
              <StatCard
                icon={Share2}
                label="Total Shares"
                value={profile?.stats.totalShares || 0}
                color="purple"
                delay={0.1}
              />
              <StatCard
                icon={Clock}
                label="Active Links"
                value={profile?.stats.activeShares || 0}
                color="green"
                delay={0.2}
              />
              <StatCard
                icon={Download}
                label="Total Downloads"
                value={profile?.stats.totalDownloads || 0}
                color="orange"
                delay={0.3}
              />
            </div>
          </motion.div>

          {/* Daily Quota */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-zinc-100">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">Today&apos;s Usage</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Resets at midnight UTC</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Uploads today</span>
                        <span className="font-semibold">
                          {profile?.stats.todayUploads || 0} / {profile?.stats.dailyLimit || 20}
                        </span>
                      </div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{ transformOrigin: "left" }}
                      >
                        <Progress value={quotaPercentage} className="h-2 sm:h-2.5" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="sm:w-40 p-4 sm:p-6 bg-muted/30 flex flex-row sm:flex-col items-center justify-center gap-2 text-center border-t sm:border-t-0 sm:border-l">
                    <p className="text-3xl sm:text-4xl font-bold text-primary">
                      {profile ? profile.stats.dailyLimit - profile.stats.todayUploads : 20}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Quick Actions
            </h2>
            <Card>
              <CardContent className="p-1.5 sm:p-2">
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-zinc-100">
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">My Files</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Manage your shared files</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </Link>
                </motion.div>

                <Separator className="mx-3 sm:mx-4" />

                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href="/history"
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-zinc-100">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Share History</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">View recent shares</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </Link>
                </motion.div>

                <Separator className="mx-3 sm:mx-4" />

                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                  <button
                    onClick={() => setChangePasswordOpen(true)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-zinc-100">
                        <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Change Password</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </button>
                </motion.div>

                <Separator className="mx-3 sm:mx-4" />

                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                  <button
                    onClick={() => setDeleteAccountOpen(true)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-destructive/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-destructive/10">
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base text-destructive">Delete Account</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Permanently delete your account</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </button>
                </motion.div>

                <Separator className="mx-3 sm:mx-4" />

                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-destructive/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-destructive/10">
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base text-destructive">Sign Out</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Log out of your account</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <Footer />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        hasPassword={profile?.user.hasPassword || false}
        userEmail={profile?.user.email || ""}
        provider={profile?.user.provider || null}
      />

      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        hasPassword={profile?.user.hasPassword || false}
        userEmail={profile?.user.email || ""}
        provider={profile?.user.provider || null}
      />
    </div>
  )
}
