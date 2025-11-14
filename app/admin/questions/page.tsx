import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import QuestionManagement from "@/components/QuestionManagement"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function QuestionsPage() {
  await requireAdmin()

  const questions = await prisma.question.findMany({
    orderBy: [
      { category: "asc" },
      { order: "asc" },
    ],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Questions</h1>
        <p className="text-muted-foreground">
          Manage core and optional questions for all agents
        </p>
      </div>

      <QuestionManagement questions={questions} />
    </div>
  )
}

