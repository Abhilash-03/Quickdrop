import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/lib/api"

export function useStats() {
    return useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const response = await statsApi.getStats()
            return response.data
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refresh every minute
    })
}
