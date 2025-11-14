import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    await prisma.agent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    console.error("Error deleting agent:", error)
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    )
  }
}

