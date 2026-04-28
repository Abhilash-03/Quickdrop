import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword, verificationMethod, currentPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ 
        error: "New password must be at least 8 characters" 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If verifying via password, check it again
    if (verificationMethod === "password" && currentPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ 
          error: "No password set for this account" 
        }, { status: 400 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
      }
    }
    // OAuth verification is handled by the session - if they have a valid session
    // and came through OAuth popup verification, we trust that

    // Hash and save new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully" 
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
