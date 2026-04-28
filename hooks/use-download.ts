import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { linkApi } from "@/lib/api"

interface UseDownloadOptions {
  code: string
  filename: string
  hasPassword: boolean
}

export function useDownload({ code, filename, hasPassword }: UseDownloadOptions) {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Password verification mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!password.trim()) {
        throw new Error("Password is required")
      }
      const response = await linkApi.verifyPassword(code, password)
      return response.data
    },
    onSuccess: (data) => {
      setIsVerified(true)
      setPreviewUrl(data.previewUrl)
      setPasswordError("")
    },
    onError: (error: AxiosError<{ error: string }>) => {
      if (error.response?.status === 401) {
        setPasswordError("Invalid password")
      } else {
        setPasswordError(error.response?.data?.error || "Verification failed")
      }
    },
  })

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (hasPassword && !isVerified) {
        throw new Error("Please verify password first")
      }
      const response = await linkApi.download(code, hasPassword ? password : undefined)
      return response.data
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Refresh link info
      queryClient.invalidateQueries({ queryKey: ["link", code] })
    },
    onError: (error: AxiosError<{ error: string }>) => {
      if (error.response?.status === 401) {
        setPasswordError("Invalid password")
        setIsVerified(false)
      }
    },
  })

  const verifyPassword = () => {
    if (!password.trim()) {
      setPasswordError("Password is required")
      return
    }
    setPasswordError("")
    verifyMutation.mutate()
  }

  const download = () => {
    downloadMutation.mutate()
  }

  return {
    download,
    isDownloading: downloadMutation.isPending,
    password,
    setPassword: (value: string) => {
      setPassword(value)
      setPasswordError("")
    },
    passwordError,
    verifyPassword,
    isVerifying: verifyMutation.isPending,
    isVerified,
    previewUrl,
  }
}
