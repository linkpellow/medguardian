import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QuestionType } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { agentId, key, label, type, required, placeholder, helpText, options } = body

    if (agentId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Check if key already exists for this agent
    const existing = await prisma.customQuestion.findUnique({
      where: {
        agentId_key: {
          agentId: user.id,
          key: key,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Question key already exists" },
        { status: 400 }
      )
    }

    // Get max order for this agent's custom questions
    const maxOrder = await prisma.customQuestion.findFirst({
      where: { agentId: user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const question = await prisma.customQuestion.create({
      data: {
        agentId: user.id,
        key,
        label,
        type: type as QuestionType,
        required: required || false,
        order: (maxOrder?.order ?? -1) + 1,
        placeholder: placeholder || null,
        helpText: helpText || null,
        options: options || null,
      },
    })

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error("Error creating custom question:", error)
    return NextResponse.json(
      { error: "Failed to create custom question" },
      { status: 500 }
    )
  }
}

