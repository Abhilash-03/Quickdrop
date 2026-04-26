import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Get user with stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      provider: true,
      passwordHash: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Determine provider (fallback for old accounts)
  const provider = user.provider || (user.passwordHash ? "credentials" : null)

  // Get file stats
  const [totalFiles, totalShares, activeShares, totalDownloads] = await Promise.all([
    prisma.file.count({
      where: { uploaderId: userId },
    }),
    prisma.shareLink.count({
      where: { uploaderId: userId },
    }),
    prisma.shareLink.count({
      where: {
        uploaderId: userId,
        status: "active",
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.shareLink.aggregate({
      where: { uploaderId: userId },
      _sum: { downloadCount: true },
    }),
  ])

  // Get today's upload count
  const today = new Date().toISOString().split("T")[0]
  const quota = await prisma.userQuota.findUnique({
    where: { userId },
  })

  const todayUploads = quota?.date === today ? quota.uploads : 0

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      provider,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      totalFiles,
      totalShares,
      activeShares,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      todayUploads,
      dailyLimit: 20,
    },
  })
}
