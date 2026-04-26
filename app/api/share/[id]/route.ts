import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { v2 as cloudinary } from "cloudinary"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { id: params.id },
    include: { file: true },
  })

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (share.uploaderId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(share.file.publicId)
  } catch (error) {
    console.error("Cloudinary delete error:", error)
  }

  // Update database
  await prisma.shareLink.update({
    where: { id: share.id },
    data: { status: "deleted" },
  })

  await prisma.file.update({
    where: { id: share.fileId },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
