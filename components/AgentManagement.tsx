"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { AgentStatus, USState } from "@prisma/client"

interface AgentManagementProps {
  agents: any[]
}

export default function AgentManagement({ agents: initialAgents }: AgentManagementProps) {
  const router = useRouter()
  const [agents, setAgents] = useState(initialAgents)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete agent")

      setAgents(agents.filter((a) => a.id !== agentId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting agent:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Agents ({agents.length})</h2>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Agents List */}
      <div className="space-y-2">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {agent.firstName} {agent.lastName}
                    </span>
                    <Badge
                      variant={
                        agent.status === "ACTIVE"
                          ? "default"
                          : agent.status === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {agent.status}
                    </Badge>
                    {agent.role === "ADMIN" && (
                      <Badge variant="outline">Admin</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.licenses.length} license(s) • {agent._count.leads} leads
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/admin/agents/${agent.id}`}
                  >
                    Override Form
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(agent.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Agent Form */}
      {showAddForm && (
        <AddAgentForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function AddAgentForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    status: "ACTIVE" as AgentStatus,
    role: "AGENT" as "AGENT" | "ADMIN",
    licenses: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create agent")

      onSuccess()
    } catch (error) {
      console.error("Error creating agent:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Agent</CardTitle>
        <CardDescription>Create a new agent account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as AgentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as "AGENT" | "ADMIN" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

