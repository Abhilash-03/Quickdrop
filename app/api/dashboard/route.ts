import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const shares = await prisma.shareLink.findMany({
    where: { uploaderId: session.user.id },
    include: { file: true },
    orderBy: { createdAt: "desc" },
  })

  const formatted = shares.map((share) => ({
    id: share.id,
    code: share.code,
    filename: share.file.filename,
    mime: share.file.mime,
    size: share.file.size,
    status: share.status,
    downloadCount: share.downloadCount,
    downloadLimit: share.downloadLimit,
    expiresAt: share.expiresAt.toISOString(),
    createdAt: share.createdAt.toISOString(),
  }))

  return NextResponse.json({ shares: formatted })
}
