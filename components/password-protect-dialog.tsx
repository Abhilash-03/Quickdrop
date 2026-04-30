"use client"

import { useState } from "react"
import { Lock, LockOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSetPassword, useRemovePassword } from "@/hooks/use-dashboard"

interface PasswordProtectDialogProps {
  shareId: string
  hasPassword: boolean
  disabled?: boolean
}

export function PasswordProtectDialog({
  shareId,
  hasPassword,
  disabled = false,
}: PasswordProtectDialogProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const setPasswordMutation = useSetPassword()
  const removePasswordMutation = useRemovePassword()

  const isLoading = setPasswordMutation.isPending || removePasswordMutation.isPending

  const handleSetPassword = async () => {
    if (password.length < 4) return

    await setPasswordMutation.mutateAsync({ id: shareId, password })
    setPassword("")
    setOpen(false)
  }

  const handleRemovePassword = async () => {
    await removePasswordMutation.mutateAsync(shareId)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setPassword("")
      setShowPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${hasPassword ? "text-amber-500" : "text-muted-foreground"}`}
                disabled={disabled}
              >
                {hasPassword ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <LockOpen className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {hasPassword ? "Password protected" : "Add password protection"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasPassword ? (
              <Lock className="h-5 w-5 text-amber-500" />
            ) : (
              <LockOpen className="h-5 w-5" />
            )}
            Password Protection
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "This file is password protected. You can change or remove the password."
              : "Add a password to protect this file. Anyone with the link will need to enter the password to download."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {hasPassword ? "New Password" : "Password"}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasPassword && (
            <Button
              variant="outline"
              onClick={handleRemovePassword}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {removePasswordMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Remove Password
            </Button>
          )}
          <Button
            onClick={handleSetPassword}
            disabled={password.length < 4 || isLoading}
            className="w-full sm:w-auto"
          >
            {setPasswordMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {hasPassword ? "Update Password" : "Set Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
