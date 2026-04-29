import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get all user's files to delete from Cloudinary
    const files = await prisma.file.findMany({
      where: { uploaderId: userId },
      select: { id: true, publicId: true },
    })

    // Delete files from Cloudinary
    const deletePromises = files.map(async (file) => {
      try {
        await cloudinary.uploader.destroy(file.publicId)
      } catch (error) {
        console.error(`Failed to delete file ${file.publicId} from Cloudinary:`, error)
      }
    })
    await Promise.all(deletePromises)

    // Delete all user's share links
    await prisma.shareLink.deleteMany({
      where: { uploaderId: userId },
    })

    // Delete all user's files
    await prisma.file.deleteMany({
      where: { uploaderId: userId },
    })

    // Delete user's quota
    await prisma.userQuota.deleteMany({
      where: { userId },
    })

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ 
      success: true,
      message: "Account deleted successfully" 
    })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
