"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { RoutingMethod, USState } from "@prisma/client"

export default function RoutingConfig() {
  const [loading, setLoading] = useState(false)
  const [routingConfig, setRoutingConfig] = useState<Record<string, RoutingMethod>>({})

  // For now, use environment variable approach
  // In production, store in database
  const handleSave = async () => {
    setLoading(true)
    // This would save to database in production
    setTimeout(() => {
      setLoading(false)
      alert("Routing configuration saved (mock)")
    }, 1000)
  }

  const states = Object.values(USState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Strategy by State</CardTitle>
        <CardDescription>
          Configure how leads are routed for each state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((state) => (
            <div key={state} className="space-y-2">
              <Label>{state}</Label>
              <Select
                value={routingConfig[state] || RoutingMethod.ROUND_ROBIN}
                onValueChange={(value) =>
                  setRoutingConfig({
                    ...routingConfig,
                    [state]: value as RoutingMethod,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoutingMethod.ROUND_ROBIN}>
                    Round Robin
                  </SelectItem>
                  <SelectItem value={RoutingMethod.WEIGHTED}>Weighted</SelectItem>
                  <SelectItem value={RoutingMethod.PRIORITY}>Priority</SelectItem>
                  <SelectItem value={RoutingMethod.MANUAL}>Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

