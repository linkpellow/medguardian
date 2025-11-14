"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Lock } from "lucide-react"

interface AgentFormOverrideProps {
  agentId: string
  agentSettings: any[]
  allQuestions: any[]
}

export default function AgentFormOverride({
  agentId,
  agentSettings: initialSettings,
  allQuestions,
}: AgentFormOverrideProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, {
    enabled: boolean
    required: boolean | null
    order: number
    customLabel: string
  }>>(
    initialSettings.reduce((acc, s) => {
      acc[s.questionId] = {
        enabled: s.enabled,
        required: s.required,
        order: s.order,
        customLabel: s.customLabel || "",
      }
      return acc
    }, {} as Record<string, {
      enabled: boolean
      required: boolean | null
      order: number
      customLabel: string
    }>)
  )

  const handleToggle = (questionId: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [questionId]: {
        ...settings[questionId],
        [field]: value,
      },
    })
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      const updates = Object.entries(settings).map(([questionId, config]) => ({
        questionId,
        enabled: config.enabled,
        required: config.required,
        order: config.order,
        customLabel: config.customLabel,
      }))

      const response = await fetch(`/api/admin/agents/${agentId}/form-override`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) throw new Error("Failed to save")

      router.refresh()
    } catch (error) {
      console.error("Error saving override:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Settings Override</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allQuestions.map((question) => {
              const setting = settings[question.id] || {
                enabled: true,
                required: question.required,
                order: question.order,
                customLabel: "",
              }
              const isCore = question.category === "CORE"

              return (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCore && <Lock className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{question.label}</span>
                      <Badge variant={isCore ? "default" : "secondary"}>
                        {question.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`enabled-${question.id}`}
                        checked={setting.enabled}
                        onCheckedChange={(checked) =>
                          handleToggle(question.id, "enabled", checked)
                        }
                        disabled={isCore}
                      />
                      <Label htmlFor={`enabled-${question.id}`} className="cursor-pointer">
                        Enabled
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${question.id}`}
                        checked={setting.required ?? question.required}
                        onCheckedChange={(checked) =>
                          handleToggle(question.id, "required", checked)
                        }
                      />
                      <Label htmlFor={`required-${question.id}`} className="cursor-pointer">
                        Required
                      </Label>
                    </div>

                    <div className="space-y-1">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={setting.order}
                        onChange={(e) =>
                          handleToggle(question.id, "order", parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Custom Label (optional)</Label>
                    <Input
                      value={setting.customLabel}
                      onChange={(e) =>
                        handleToggle(question.id, "customLabel", e.target.value)
                      }
                      placeholder={question.label}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Override"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

