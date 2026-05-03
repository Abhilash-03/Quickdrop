import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAILY_LIMITS = {
  anonymous: 3,
  authenticated: 20,
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const today = getTodayDate();

    if (session?.user?.id) {
      // Authenticated user quota
      const quota = await prisma.userQuota.findUnique({
        where: { userId: session.user.id },
      });

      const isNewDay = quota?.date !== today;
      const used = isNewDay ? 0 : (quota?.uploads || 0);

      return NextResponse.json({
        used,
        limit: DAILY_LIMITS.authenticated,
        remaining: DAILY_LIMITS.authenticated - used,
        isAnonymous: false,
      });
    }

    // Anonymous quota - Use IP address for consistency with share API
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "";

    // If IP can't be determined, return full quota (actual enforcement happens at upload time)
    if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
      return NextResponse.json({
        used: 0,
        limit: DAILY_LIMITS.anonymous,
        remaining: DAILY_LIMITS.anonymous,
        isAnonymous: true,
      });
    }

    const quota = await prisma.anonQuota.findUnique({
      where: { ip },
    });

    if (!quota) {
      return NextResponse.json({
        used: 0,
        limit: DAILY_LIMITS.anonymous,
        remaining: DAILY_LIMITS.anonymous,
        isAnonymous: true,
      });
    }

    // Check if it's a new day (reset)
    const quotaDate = quota.updatedAt.toISOString().split("T")[0];
    const isNewDay = quotaDate !== today;
    const used = isNewDay ? 0 : quota.uploads;

    return NextResponse.json({
      used,
      limit: DAILY_LIMITS.anonymous,
      remaining: DAILY_LIMITS.anonymous - used,
      isAnonymous: true,
    });
  } catch (error) {
    console.error("Quota API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quota" },
      { status: 500 }
    );
  }
}
