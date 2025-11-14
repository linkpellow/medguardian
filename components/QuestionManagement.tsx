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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import { QuestionType, QuestionCategory } from "@prisma/client"

interface QuestionManagementProps {
  questions: any[]
}

export default function QuestionManagement({
  questions: initialQuestions,
}: QuestionManagementProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-2">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{q.label}</span>
                    <Badge
                      variant={q.category === "CORE" ? "default" : "secondary"}
                    >
                      {q.category}
                    </Badge>
                    <Badge variant="outline">{q.type.replace("_", " ")}</Badge>
                    {q.required && (
                      <Badge variant="outline">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Key: {q.key}</p>
                  <p className="text-xs text-muted-foreground">Order: {q.order}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddForm && (
        <AddQuestionForm
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

function AddQuestionForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    key: string
    label: string
    type: QuestionType
    category: QuestionCategory
    required: boolean
    order: number
    placeholder: string
    helpText: string
  }>({
    key: "",
    label: "",
    type: QuestionType.SHORT_TEXT,
    category: QuestionCategory.OPTIONAL,
    required: false,
    order: 0,
    placeholder: "",
    helpText: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create question")

      onSuccess()
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Global Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Key *</Label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as QuestionCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionCategory.CORE}>Core</SelectItem>
                  <SelectItem value={QuestionCategory.OPTIONAL}>Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question Label *</Label>
            <Input
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as QuestionType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.SHORT_TEXT}>Short Text</SelectItem>
                  <SelectItem value={QuestionType.LONG_TEXT}>Long Text</SelectItem>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                  <SelectItem value={QuestionType.YES_NO}>Yes/No</SelectItem>
                  <SelectItem value={QuestionType.NUMBER}>Number</SelectItem>
                  <SelectItem value={QuestionType.DATE}>Date</SelectItem>
                  <SelectItem value={QuestionType.EMAIL}>Email</SelectItem>
                  <SelectItem value={QuestionType.PHONE}>Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
              />
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
                "Create Question"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

