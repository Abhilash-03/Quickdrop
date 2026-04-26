"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuthModal } from "@/lib/auth-modal-store"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { status } = useSession()
  const { openSignup } = useAuthModal()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    } else if (status === "unauthenticated") {
      router.push("/")
      openSignup()
    }
  }, [status, router, openSignup])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
