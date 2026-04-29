import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Verify user identity via password
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.passwordHash) {
      return NextResponse.json({ 
        error: "No password set for this account. Use OAuth verification instead." 
      }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Identity verified" 
    })
  } catch (error) {
    console.error("Verify identity error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
