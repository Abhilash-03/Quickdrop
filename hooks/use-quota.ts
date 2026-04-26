import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";

interface QuotaData {
  used: number;
  limit: number;
  remaining: number;
  isAnonymous: boolean;
}

async function fetchQuota(): Promise<QuotaData> {
  const { data } = await axios.get<QuotaData>("/api/quota");
  return data;
}

export function useQuota() {
  const { status } = useSession();
  
  return useQuery({
    queryKey: ["quota", status],
    queryFn: fetchQuota,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
