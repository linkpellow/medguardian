import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import AgentFormOverride from "@/components/AgentFormOverride"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      questionSettings: {
        include: {
          question: true,
        },
      },
      customQuestions: true,
    },
  })

  if (!agent) {
    notFound()
  }

  const allQuestions = await prisma.question.findMany({
    where: {
      category: {
        in: ["CORE", "OPTIONAL"],
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Override Form Config: {agent.firstName} {agent.lastName}
        </h1>
        <p className="text-muted-foreground">
          Override agent's form question settings
        </p>
      </div>

      <AgentFormOverride
        agentId={agent.id}
        agentSettings={agent.questionSettings}
        allQuestions={allQuestions}
      />
    </div>
  )
}

