"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"
import { toast } from "sonner"

export interface Share {
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
}

// Fetch all shares
export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "shares"],
    queryFn: async () => {
      const res = await dashboardApi.getShares()
      return res.data.shares as Share[]
    },
    enabled,
  })
}

// Delete a share
export function useDeleteShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteShare(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["dashboard", "shares"] })

      // Snapshot previous value
      const previous = queryClient.getQueryData<Share[]>(["dashboard", "shares"])

      // Optimistic update
      queryClient.setQueryData<Share[]>(["dashboard", "shares"], (old) =>
        old?.filter((share) => share.id !== id)
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["dashboard", "shares"], context.previous)
      }
      toast.error("Failed to delete file")
    },
    onSuccess: () => {
      toast.success("File deleted")
    },
  })
}

// Set password for a share
export function useSetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      dashboardApi.setPassword(id, password),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "shares"] })
      const previous = queryClient.getQueryData<Share[]>(["dashboard", "shares"])

      // Optimistic update
      queryClient.setQueryData<Share[]>(["dashboard", "shares"], (old) =>
        old?.map((share) =>
          share.id === id ? { ...share, hasPassword: true } : share
        )
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["dashboard", "shares"], context.previous)
      }
      toast.error("Failed to set password")
    },
    onSuccess: () => {
      toast.success("Password protection enabled")
    },
  })
}

// Remove password from a share
export function useRemovePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dashboardApi.removePassword(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "shares"] })
      const previous = queryClient.getQueryData<Share[]>(["dashboard", "shares"])

      // Optimistic update
      queryClient.setQueryData<Share[]>(["dashboard", "shares"], (old) =>
        old?.map((share) =>
          share.id === id ? { ...share, hasPassword: false } : share
        )
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["dashboard", "shares"], context.previous)
      }
      toast.error("Failed to remove password")
    },
    onSuccess: () => {
      toast.success("Password protection disabled")
    },
  })
}
