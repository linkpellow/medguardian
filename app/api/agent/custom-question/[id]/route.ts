import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify the question belongs to the user
    const question = await prisma.customQuestion.findUnique({
      where: { id },
    })

    if (!question || question.agentId !== user.id) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    await prisma.customQuestion.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting custom question:", error)
    return NextResponse.json(
      { error: "Failed to delete custom question" },
      { status: 500 }
    )
  }
}

