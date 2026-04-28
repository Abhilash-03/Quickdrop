import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { linkApi } from "@/lib/api"
import { useUploadStore, type ShareHistoryItem } from "@/lib/upload-store"

// Extract code from share URL
function extractCode(shareUrl: string): string | null {
  try {
    const url = new URL(shareUrl)
    const pathParts = url.pathname.split("/")
    // URL format: /d/{code}
    const dIndex = pathParts.indexOf("d")
    if (dIndex !== -1 && pathParts[dIndex + 1]) {
      return pathParts[dIndex + 1]
    }
    return null
  } catch {
    return null
  }
}

export function useSyncHistory(items: ShareHistoryItem[]) {
  const removeFromHistory = useUploadStore((state) => state.removeFromHistory)

  // Extract codes from share URLs
  const codes = items
    .map(item => extractCode(item.shareUrl))
    .filter((code): code is string => code !== null)

  const { data, isLoading } = useQuery({
    queryKey: ["link-statuses", codes.sort().join(",")],
    queryFn: async () => {
      if (codes.length === 0) return { statuses: {} }
      const response = await linkApi.checkStatuses(codes)
      return response.data
    },
    enabled: codes.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  // Remove inactive items from local storage
  useEffect(() => {
    if (!data?.statuses) return

    items.forEach(item => {
      const code = extractCode(item.shareUrl)
      if (code && data.statuses[code] && !data.statuses[code].active) {
        removeFromHistory(item.id)
      }
    })
  }, [data, items, removeFromHistory])

  return { isLoading }
}
