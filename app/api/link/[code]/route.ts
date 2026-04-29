import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// Generate signed URL for raw files
function getSignedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    sign_url: true,
  })
}

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
  const hasPassword = !!link.passwordHash

  // Generate signed URL for raw files (PDFs, etc.)
  const isRawFile = !link.file.mime.startsWith("image/") && !link.file.mime.startsWith("video/")
  const previewUrl = isRawFile 
    ? getSignedUrl(link.file.publicId)
    : link.file.secureUrl

  return NextResponse.json({
    filename: link.file.filename,
    mime: link.file.mime,
    size: link.file.size,
    expiresAt: link.expiresAt.toISOString(),
    downloadsRemaining,
    downloadLimit: link.downloadLimit,
    // Don't expose preview URL for password-protected links
    previewUrl: hasPassword ? null : previewUrl,
    hasPassword,
  })
}

// Verify password and get preview URL
export async function POST(
  req: NextRequest,
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
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }

  const now = new Date()
  if (link.expiresAt <= now) {
    return NextResponse.json({ error: "Link has expired" }, { status: 410 })
  }

  if (!link.passwordHash) {
    return NextResponse.json({ error: "Link is not password protected" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const password = body.password

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, link.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  // Generate signed URL for raw files (PDFs, etc.)
  const isRawFile = !link.file.mime.startsWith("image/") && !link.file.mime.startsWith("video/")
  const previewUrl = isRawFile 
    ? getSignedUrl(link.file.publicId)
    : link.file.secureUrl

  // Password correct - return preview URL
  return NextResponse.json({
    verified: true,
    previewUrl,
  })
}
