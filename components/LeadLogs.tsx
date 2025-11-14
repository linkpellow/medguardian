"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LeadStatus, RoutingMethod } from "@prisma/client"

interface LeadLogsProps {
  leads: any[]
}

export default function LeadLogs({ leads }: LeadLogsProps) {
  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </span>
                  <Badge
                    variant={
                      lead.status === "ASSIGNED"
                        ? "default"
                        : lead.status === "CONVERTED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{lead.email} • {lead.phone}</p>
                  <p>{lead.state} • {lead.zip}</p>
                  {lead.agent && (
                    <p>
                      Agent: {lead.agent.firstName} {lead.agent.lastName}
                    </p>
                  )}
                  {lead.routingLog && (
                    <p className="text-xs">
                      Routed via {lead.routingLog.method} •{" "}
                      {lead.routingLog.processingTimeMs}ms
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {new Date(lead.submittedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

