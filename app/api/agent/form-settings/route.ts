import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { agentId, updates } = body

    if (agentId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Separate system questions and custom questions
    const systemQuestionIds = new Set(
      (await prisma.question.findMany({ select: { id: true } })).map((q) => q.id)
    )

    const systemUpdates = updates.filter((u: any) => systemQuestionIds.has(u.questionId))
    const customUpdates = updates.filter((u: any) => !systemQuestionIds.has(u.questionId))

    // Update system question settings
    const systemPromises = systemUpdates.map((update: any) =>
      prisma.agentQuestionSetting.upsert({
        where: {
          agentId_questionId: {
            agentId: user.id,
            questionId: update.questionId,
          },
        },
        update: {
          enabled: update.enabled,
          order: update.order,
        },
        create: {
          agentId: user.id,
          questionId: update.questionId,
          enabled: update.enabled,
          order: update.order,
        },
      })
    )

    // Update custom question orders (verify ownership first)
    // Note: CustomQuestion doesn't have 'enabled' field, only order
    const customQuestionIds = customUpdates.map((u: any) => u.questionId)
    const existingCustomQuestions = await prisma.customQuestion.findMany({
      where: {
        id: { in: customQuestionIds },
        agentId: user.id,
      },
    })

    const validCustomQuestionIds = new Set(existingCustomQuestions.map((q) => q.id))
    const validCustomUpdates = customUpdates.filter((u: any) =>
      validCustomQuestionIds.has(u.questionId)
    )

    const customPromises = validCustomUpdates.map((update: any) =>
      prisma.customQuestion.update({
        where: { id: update.questionId },
        data: {
          order: update.order,
        },
      })
    )

    await Promise.all([...systemPromises, ...customPromises])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating form settings:", error)
    return NextResponse.json(
      { error: "Failed to update form settings" },
      { status: 500 }
    )
  }
}

