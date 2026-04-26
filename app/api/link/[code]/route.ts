import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Get share link info without downloading
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  const link = await prisma.shareLink.findUnique({
    where: { code },
    include: { file: true },
  })

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  if (link.status !== "active") {
    return NextResponse.json({ error: "Link has expired", status: link.status }, { status: 410 })
  }

  const now = new Date()
  if (link.expiresAt <= now) {
    return NextResponse.json({ error: "Link has expired", status: "expired" }, { status: 410 })
  }

  const downloadsRemaining = link.downloadLimit - link.downloadCount

  return NextResponse.json({
    filename: link.file.filename,
    mime: link.file.mime,
    size: link.file.size,
    expiresAt: link.expiresAt.toISOString(),
    downloadsRemaining,
    downloadLimit: link.downloadLimit,
  })
}
