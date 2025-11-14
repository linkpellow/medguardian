import { NextRequest, NextResponse } from "next/server"
import { mockLogin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      )
    }

    const user = await mockLogin(agentId)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid agent ID" },
        { status: 401 }
      )
    }

    // Return user with role for client-side redirect
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { role: true },
    })

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        role: agent?.role || "AGENT",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}

