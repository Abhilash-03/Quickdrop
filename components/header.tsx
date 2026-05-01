"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Upload, LogOut, LayoutDashboard, User, History, ScanLine } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthModal } from "@/lib/auth-modal-store"
import { useUploadStore } from "@/lib/upload-store"
import { useQRScannerStore } from "@/lib/qr-scanner-store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { data: session, status } = useSession()
  const { openLogin } = useAuthModal()
  const shareHistory = useUploadStore((state) => state.shareHistory)
  const openScanner = useQRScannerStore((state) => state.open)

  // Count only active (non-expired) shares
  const activeShareCount = useMemo(() => {
    const now = Date.now()
    return shareHistory.filter(item => {
      const expiresAt = item.createdAt + (item.expiresInHours * 60 * 60 * 1000)
      return expiresAt > now
    }).length
  }, [shareHistory])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Upload className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">QuickDrop</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={openScanner}>
                  <ScanLine className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scan QR Code</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link href="/history">
                    <History className="h-5 w-5" />
                    {activeShareCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center shadow-sm ring-2 ring-background">
                        {activeShareCount > 99 ? "99+" : activeShareCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share History</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ThemeToggle />
          
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    {session.user.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={openLogin}>
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
