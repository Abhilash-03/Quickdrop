import { useQuery } from "@tanstack/react-query"
import { linkApi } from "@/lib/api"

export function useLinkInfo(code: string) {
  return useQuery({
    queryKey: ["link", code],
    queryFn: async () => {
      const { data } = await linkApi.getInfo(code)
      return data
    },
    retry: false,
    enabled: !!code,
    staleTime: 0, // Always refetch to get latest password status
    refetchOnWindowFocus: true,
  })
}
