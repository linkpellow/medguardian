import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import AgentManagement from "@/components/AgentManagement"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  await requireAdmin()

  const agents = await prisma.agent.findMany({
    include: {
      profile: true,
      licenses: true,
      _count: {
        select: {
          leads: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Management</h1>
        <p className="text-muted-foreground">Add, remove, and manage agents</p>
      </div>

      <AgentManagement agents={agents} />
    </div>
  )
}

