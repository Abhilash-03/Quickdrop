import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Get global stats
export async function GET() {
    try {
        // Get or create the global stats record
        const stats = await prisma.stats.upsert({
            where: { key: "global" },
            update: {},
            create: { key: "global" }
        })

        return NextResponse.json({
            totalUploads: stats.totalUploads,
            totalDownloads: stats.totalDownloads
        })
    } catch (error) {
        console.error("Stats API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}

// Increment stats (for P2P transfers)
const incrementSchema = z.object({
    type: z.enum(["upload", "download"])
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { type } = incrementSchema.parse(body)

        const updateData = type === "upload" 
            ? { totalUploads: { increment: 1 } }
            : { totalDownloads: { increment: 1 } }

        await prisma.stats.upsert({
            where: { key: "global" },
            update: updateData,
            create: {
                key: "global",
                totalUploads: type === "upload" ? 1 : 0,
                totalDownloads: type === "download" ? 1 : 0
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Stats increment error:", error)
        return NextResponse.json(
            { error: "Failed to update stats" },
            { status: 500 }
        )
    }
}
