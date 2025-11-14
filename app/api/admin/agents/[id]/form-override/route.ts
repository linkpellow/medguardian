import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id: agentId } = await params
    const body = await request.json()
    const { updates } = body

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }

    // Update or create question settings
    const promises = updates.map((update: any) =>
      prisma.agentQuestionSetting.upsert({
        where: {
          agentId_questionId: {
            agentId,
            questionId: update.questionId,
          },
        },
        update: {
          enabled: update.enabled,
          required: update.required,
          order: update.order,
          customLabel: update.customLabel || null,
        },
        create: {
          agentId,
          questionId: update.questionId,
          enabled: update.enabled,
          required: update.required,
          order: update.order,
          customLabel: update.customLabel || null,
        },
      })
    )

    await Promise.all(promises)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    console.error("Error updating form override:", error)
    return NextResponse.json(
      { error: "Failed to update form override" },
      { status: 500 }
    )
  }
}

