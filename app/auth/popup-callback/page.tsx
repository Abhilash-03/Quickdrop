"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

function PopupCallbackContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider")
  const email = searchParams.get("email")
  const error = searchParams.get("error")
  const [signingIn, setSigningIn] = useState(false)

  // Handle OAuth errors (e.g., when prompt=none fails)
  useEffect(() => {
    if (error && window.opener) {
      window.opener.postMessage(
        { type: "OAUTH_FAILURE", error: "Verification failed. Please try again." },
        window.location.origin
      )
      setTimeout(() => window.close(), 500)
    }
  }, [error])

  // If provider param exists, initiate OAuth signin
  useEffect(() => {
    if (error) return // Don't try to sign in if there's an error
    if (provider && !signingIn && status !== "authenticated") {
      setSigningIn(true)
      
      const callbackUrl = window.location.origin + "/auth/popup-callback"
      
      // For Google, pass login_hint and prompt as authorization params (3rd argument)
      if (provider === "google" && email) {
        signIn("google", 
          { callbackUrl, redirect: true },
          { login_hint: email, prompt: "select_account" }
        )
      } 
      // For GitHub
      else if (provider === "github" && email) {
        signIn("github",
          { callbackUrl, redirect: true },
          { login: email }
        )
      }
      // Fallback
      else {
        signIn(provider, { callbackUrl, redirect: true })
      }
    }
  }, [provider, email, signingIn, status, error])

  // Handle callback after OAuth completes
  useEffect(() => {
    if (status === "loading" || provider) return

    if (status === "authenticated" && session?.user) {
      // Send result to parent window - parent decides if email matches
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
            user: {
              email: session.user.email,
              name: session.user.name,
            },
          },
          window.location.origin
        )
        // Close popup immediately - parent handles success/error message
        setTimeout(() => window.close(), 500)
      }
    } else if (status === "unauthenticated" && !provider) {
      // Send failure message to parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "OAUTH_FAILURE", error: "Authentication failed" },
          window.location.origin
        )
        setTimeout(() => window.close(), 500)
      }
    }
  }, [status, session, provider])

  // Always show loading/processing state - parent handles final feedback
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">
        {provider ? "Redirecting to provider..." : "Processing..."}
      </p>
      <p className="text-xs text-muted-foreground">This window will close automatically</p>
    </div>
  )
}

// This page handles OAuth popup - either initiates signin or shows callback result
export default function PopupCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <PopupCallbackContent />
    </Suspense>
  )
}
