import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await requireAdmin()

  const [agentsCount, leadsCount, questionsCount, routingLogsCount] = await Promise.all([
    prisma.agent.count(),
    prisma.lead.count(),
    prisma.question.count(),
    prisma.routingLog.count(),
  ])

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { submittedAt: "desc" },
    include: {
      agent: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Routing Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routingLogsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lead.email} • {lead.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {lead.agent
                      ? `${lead.agent.firstName} ${lead.agent.lastName}`
                      : "Unassigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lead.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

