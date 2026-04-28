import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Check status of multiple links at once
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const codes = body.codes as string[]

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Limit to prevent abuse
    if (codes.length > 50) {
      return NextResponse.json({ error: "Too many codes" }, { status: 400 })
    }

    const links = await prisma.shareLink.findMany({
      where: { code: { in: codes } },
      select: {
        code: true,
        status: true,
        downloadCount: true,
        downloadLimit: true,
        expiresAt: true,
      },
    })

    const now = new Date()
    const statuses: Record<string, { active: boolean; reason?: string }> = {}

    // Initialize all codes as not found
    codes.forEach(code => {
      statuses[code] = { active: false, reason: "not_found" }
    })

    // Update with actual statuses
    links.forEach(link => {
      if (link.status !== "active") {
        statuses[link.code] = { active: false, reason: "expired" }
      } else if (link.expiresAt <= now) {
        statuses[link.code] = { active: false, reason: "time_expired" }
      } else if (link.downloadCount >= link.downloadLimit) {
        statuses[link.code] = { active: false, reason: "limit_reached" }
      } else {
        statuses[link.code] = { active: true }
      }
    })

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error("Link status check error:", error)
    return NextResponse.json({ error: "Failed to check statuses" }, { status: 500 })
  }
}
