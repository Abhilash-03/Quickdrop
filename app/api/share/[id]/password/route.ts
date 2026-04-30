import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Add or update password
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { id },
  })

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (share.uploaderId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (share.status !== "active") {
    return NextResponse.json({ error: "Share is not active" }, { status: 400 })
  }

  const { password } = await req.json()

  if (!password || typeof password !== "string" || password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters" },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.shareLink.update({
    where: { id },
    data: { passwordHash },
  })

  return NextResponse.json({ success: true, hasPassword: true })
}

// Remove password
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { id },
  })

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (share.uploaderId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.shareLink.update({
    where: { id },
    data: { passwordHash: null },
  })

  return NextResponse.json({ success: true, hasPassword: false })
}
