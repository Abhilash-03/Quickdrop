"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuthModal } from "@/lib/auth-modal-store"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const { openLogin } = useAuthModal()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    } else if (status === "unauthenticated") {
      router.push("/")
      openLogin()
    }
  }, [status, router, openLogin])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
