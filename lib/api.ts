import axios from "axios"

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "Something went wrong"
    return Promise.reject(new Error(message))
  }
)

// API functions
export const uploadApi = {
  getSignature: (mime: string, size: number) =>
    api.post<{
      cloudName: string
      apiKey: string
      timestamp: number
      folder: string
      signature: string
      resourceType: string
    }>("/upload/sign", { mime, size }),

  createShare: (data: {
    filename: string
    mime: string
    size: number
    secureUrl: string
    publicId: string
    expiresInHours: number
    downloadLimit: number
    checksum: string
    isAnonymous: boolean
    password?: string
  }) => api.post<{ url: string }>("/share", data),
}

export const linkApi = {
  getInfo: (code: string) =>
    api.get<{
      filename: string
      mime: string
      size: number
      expiresAt: string
      downloadsRemaining: number
      downloadLimit: number
      previewUrl: string | null
      hasPassword: boolean
    }>(`/link/${code}`),

  verifyPassword: (code: string, password: string) =>
    api.post<{
      verified: boolean
      previewUrl: string
    }>(`/link/${code}`, { password }),

  download: (code: string, password?: string) =>
    axios({
      url: `/download/${code}`,
      method: password ? "POST" : "GET",
      data: password ? { password } : undefined,
      responseType: "blob",
    }),

  checkStatuses: (codes: string[]) =>
    api.post<{
      statuses: Record<string, { active: boolean; reason?: string }>
    }>("/links/status", { codes }),
}

export const dashboardApi = {
  getShares: () =>
    api.get<{
      shares: Array<{
        id: string
        code: string
        filename: string
        mime: string
        size: number
        status: string
        downloadCount: number
        downloadLimit: number
        expiresAt: string
        createdAt: string
        hasPassword: boolean
      }>
    }>("/dashboard"),

  deleteShare: (id: string) => api.delete(`/share/${id}`),

  setPassword: (id: string, password: string) =>
    api.patch<{ success: boolean; hasPassword: boolean }>(`/share/${id}/password`, { password }),

  removePassword: (id: string) =>
    api.delete<{ success: boolean; hasPassword: boolean }>(`/share/${id}/password`),
}

// Cloudinary upload with progress
export const uploadToCloudinary = async (
  file: File,
  config: {
    cloudName: string
    apiKey: string
    timestamp: number
    folder: string
    signature: string
    resourceType: string
  },
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", config.apiKey)
  formData.append("timestamp", config.timestamp.toString())
  formData.append("folder", config.folder)
  formData.append("signature", config.signature)

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${config.resourceType}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    }
  )

  return response.data as {
    secure_url: string
    public_id: string
  }
}
