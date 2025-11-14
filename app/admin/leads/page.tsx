import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import LeadLogs from "@/components/LeadLogs"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  await requireAdmin()

  const leads = await prisma.lead.findMany({
    take: 100,
    orderBy: { submittedAt: "desc" },
    include: {
      agent: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      routingLog: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Logs</h1>
        <p className="text-muted-foreground">
          View all submitted leads and routing information
        </p>
      </div>

      <LeadLogs leads={leads} />
    </div>
  )
}

