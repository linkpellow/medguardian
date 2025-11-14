import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AgentStatus, UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { firstName, lastName, email, password, status, role } = body

    // Check if email already exists
    const existing = await prisma.agent.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        status: status || AgentStatus.ACTIVE,
        role: role || UserRole.AGENT,
      },
    })

    return NextResponse.json({ success: true, agent })
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    console.error("Error creating agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}

