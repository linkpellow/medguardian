import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import FormBuilder from "@/components/FormBuilder"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function FormBuilderPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch agent's question settings and available questions
  const [agentSettings, systemQuestions, customQuestions] = await Promise.all([
    prisma.agentQuestionSetting.findMany({
      where: { agentId: user.id },
      include: { question: true },
    }),
    prisma.question.findMany({
      where: {
        category: {
          in: ["CORE", "OPTIONAL"],
        },
      },
      orderBy: { order: "asc" },
    }),
    prisma.customQuestion.findMany({
      where: { agentId: user.id },
      orderBy: { order: "asc" },
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form Builder</h1>
        <p className="text-muted-foreground">
          Customize which questions appear on your form and add your own
        </p>
      </div>

      <FormBuilder
        agentId={user.id}
        agentSettings={agentSettings}
        systemQuestions={systemQuestions}
        customQuestions={customQuestions}
      />
    </div>
  )
}

