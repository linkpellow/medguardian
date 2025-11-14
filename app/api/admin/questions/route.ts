import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { QuestionType, QuestionCategory } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { key, label, type, category, required, order, placeholder, helpText } = body

    // Check if key already exists
    const existing = await prisma.question.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Question key already exists" },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        key,
        label,
        type: type as QuestionType,
        category: category as QuestionCategory,
        required: required || false,
        order: order || 0,
        placeholder: placeholder || null,
        helpText: helpText || null,
      },
    })

    return NextResponse.json({ success: true, question })
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}

