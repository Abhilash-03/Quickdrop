"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { signOut } from "next-auth/react"
import { Loader2, Trash2, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useUploadStore } from "@/lib/upload-store"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasPassword: boolean
  userEmail: string
  provider: string | null
}

type Step = "verify" | "confirm"

export function DeleteAccountDialog({ 
  open, 
  onOpenChange, 
  hasPassword,
  userEmail,
  provider
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<Step>("verify")
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("verify")
        setIsVerified(false)
        setCurrentPassword("")
        setConfirmText("")
        setIsLoading(false)
        setIsOAuthLoading(null)
      }, 200)
    }
  }, [open])

  // Handle OAuth popup message
  const handleOAuthMessage = useCallback(async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    
    if (event.data.type === "OAUTH_SUCCESS") {
      if (event.data.user?.email === userEmail) {
        setIsVerified(true)
        setStep("confirm")
        setIsOAuthLoading(null)
        toast.success("Identity verified!")
      } else {
        setIsOAuthLoading(null)
        onOpenChange(false)
        toast.error(
          `Wrong account selected. Please sign in again with ${userEmail}`,
          { duration: 5000 }
        )
        await signOut({ redirect: false })
      }
    } else if (event.data.type === "OAUTH_FAILURE") {
      toast.error("Verification failed. Please try again.")
      setIsOAuthLoading(null)
    }
  }, [userEmail, onOpenChange])

  useEffect(() => {
    window.addEventListener("message", handleOAuthMessage)
    return () => window.removeEventListener("message", handleOAuthMessage)
  }, [handleOAuthMessage])

  const handlePasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post("/api/auth/verify-identity", { password: currentPassword })
      setIsVerified(true)
      setStep("confirm")
      toast.success("Identity verified!")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Verification failed")
      } else {
        toast.error("Something went wrong")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthVerify = (providerName: string) => {
    setIsOAuthLoading(providerName)
    
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const popup = window.open(
      `/auth/popup-callback?provider=${providerName}&email=${encodeURIComponent(userEmail)}`,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    )

    if (!popup) {
      toast.error("Popup blocked. Please allow popups for this site.")
      setIsOAuthLoading(null)
      return
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        setIsOAuthLoading(null)
      }
    }, 500)
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    setIsLoading(true)

    try {
      await axios.delete("/api/auth/delete-account")
      
      // Clear local share history
      useUploadStore.getState().clearHistory()
      
      toast.success("Account deleted successfully")
      onOpenChange(false)
      // Sign out and redirect
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to delete account")
      } else {
        toast.error("Something went wrong")
      }
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            {step === "verify" 
              ? "Please verify your identity before deleting your account"
              : "This action cannot be undone"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "verify" && (
          <div className="space-y-4 pt-2">
            {/* Password verification */}
            {hasPassword && (
              <form onSubmit={handlePasswordVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter your password to verify your identity
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isLoading || !!isOAuthLoading}
                  />
                </div>
                <Button type="submit" variant="destructive" className="w-full" disabled={isLoading || !!isOAuthLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify with Password
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            {hasPassword && (provider === "google" || provider === "github") && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or verify with
                  </span>
                </div>
              </div>
            )}

            {/* OAuth verification */}
            {(provider === "google" || provider === "github") && (
              <div className="space-y-4">
                {!hasPassword && (
                  <p className="text-sm text-muted-foreground text-center">
                    Click below to verify with your {provider === "google" ? "Google" : "GitHub"} account
                  </p>
                )}
                {provider === "google" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthVerify("google")}
                    disabled={isLoading || !!isOAuthLoading}
                  >
                    {isOAuthLoading === "google" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Verify with Google
                  </Button>
                )}
                {provider === "github" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthVerify("github")}
                    disabled={isLoading || !!isOAuthLoading}
                  >
                    {isOAuthLoading === "github" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    Verify with GitHub
                  </Button>
                )}
              </div>
            )}

            {isOAuthLoading && (
              <p className="text-xs text-center text-muted-foreground">
                Complete verification in the popup window...
              </p>
            )}
          </div>
        )}

        {step === "confirm" && isVerified && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Warning: This action is irreversible</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• All your uploaded files will be permanently deleted</li>
                    <li>• All your share links will be removed</li>
                    <li>• Your account data will be erased</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <span className="font-mono text-destructive">DELETE</span> to confirm
              </label>
              <Input
                type="text"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={isLoading || confirmText !== "DELETE"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
