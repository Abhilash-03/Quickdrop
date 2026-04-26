import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadApi, uploadToCloudinary } from "@/lib/api"
import { useUploadStore } from "@/lib/upload-store"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Compute SHA-256 checksum
async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Sanitize Cloudinary error messages
function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  
  if (message.toLowerCase().includes("file size too large")) {
    return "File too large. Maximum size is 10MB"
  }
  if (message.toLowerCase().includes("invalid")) {
    return "Invalid file format"
  }
  if (message.toLowerCase().includes("unauthorized")) {
    return "Upload authorization failed. Please try again"
  }
  
  return message || "Upload failed"
}

export function useFileUpload() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const {
    currentFile,
    expiresInHours,
    downloadLimit,
    setProgress,
    setStatus,
    setError,
    setShareUrl,
  } = useUploadStore()

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!currentFile) throw new Error("No file selected")

      // Validate limits
      if (downloadLimit < 1 || downloadLimit > 100) {
        throw new Error("Download limit must be between 1 and 100")
      }

      setStatus("uploading")

      // 1. Get signed upload params
      const { data: signData } = await uploadApi.getSignature(
        currentFile.file.type,
        currentFile.file.size
      )

      // 2. Upload to Cloudinary with progress
      const uploadResult = await uploadToCloudinary(
        currentFile.file,
        signData,
        (percent) => setProgress(percent)
      )

      setStatus("processing")

      // 3. Compute checksum
      const checksum = await computeChecksum(currentFile.file)

      // 4. Create share link
      const { data: shareData } = await uploadApi.createShare({
        filename: currentFile.file.name,
        mime: currentFile.file.type,
        size: currentFile.file.size,
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        expiresInHours,
        downloadLimit,
        checksum,
        isAnonymous: !session?.user,
      })

      return shareData.url
    },
    onSuccess: (url) => {
      setShareUrl(url)
      queryClient.invalidateQueries({ queryKey: ["quota"] })
      toast.success("File uploaded successfully!")
    },
    onError: (error) => {
      const message = sanitizeError(error)
      setError(message)
      toast.error(message)
    },
  })

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  }
}
