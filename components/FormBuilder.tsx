"use client"

import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  GripVertical,
  Plus,
  Trash2,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { QuestionType, QuestionCategory } from "@prisma/client"

interface FormBuilderProps {
  agentId: string
  agentSettings: any[]
  systemQuestions: any[]
  customQuestions: any[]
}

interface QuestionItem {
  id: string
  key: string
  label: string
  type: QuestionType
  category: QuestionCategory
  required: boolean
  enabled: boolean
  order: number
  locked?: boolean
  options?: any
  validation?: any
  helpText?: string
  placeholder?: string
}

function SortableQuestionItem({
  question,
  onToggle,
  onDelete,
  isCustom,
}: {
  question: QuestionItem
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  isCustom: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 border rounded-lg bg-card ${
        question.locked ? "opacity-60" : ""
      }`}
    >
      {!question.locked && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      {question.locked && (
        <Lock className="h-5 w-5 text-muted-foreground" />
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{question.label}</span>
          {question.locked && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
          {question.category === "CUSTOM" && (
            <Badge variant="outline" className="text-xs">
              Custom
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {question.type.replace("_", " ")}
          </Badge>
        </div>
        {question.helpText && (
          <p className="text-xs text-muted-foreground">{question.helpText}</p>
        )}
      </div>

      {!question.locked && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(question.id)}
          >
            {question.enabled ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          {isCustom && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function FormBuilder({
  agentId,
  agentSettings,
  systemQuestions,
  customQuestions,
}: FormBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  // Create settings map
  const settingsMap = new Map(
    agentSettings.map((s) => [s.questionId, s])
  )

  // Build question items
  const buildQuestionItems = (questions: any[], isCustom: boolean = false): QuestionItem[] => {
    return questions.map((q) => {
      const setting = settingsMap.get(q.id)
      return {
        id: q.id,
        key: q.key,
        label: q.label,
        type: q.type,
        category: q.category,
        required: q.required,
        enabled: setting ? setting.enabled : !isCustom && q.category === "OPTIONAL",
        order: setting?.order ?? q.order,
        locked: q.category === "CORE",
        options: q.options,
        validation: q.validation,
        helpText: q.helpText,
        placeholder: q.placeholder,
      }
    })
  }

  const [systemQuestionItems, setSystemQuestionItems] = useState<QuestionItem[]>(
    buildQuestionItems(systemQuestions)
  )
  const [customQuestionItems, setCustomQuestionItems] = useState<QuestionItem[]>(
    buildQuestionItems(customQuestions, true)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (
    event: DragEndEvent,
    items: QuestionItem[],
    setItems: React.Dispatch<React.SetStateAction<QuestionItem[]>>
  ) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id)
        const newIndex = currentItems.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(currentItems, oldIndex, newIndex)
        // Update order values
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }))
      })
    }
  }

  const handleToggle = (
    id: string,
    items: QuestionItem[],
    setItems: React.Dispatch<React.SetStateAction<QuestionItem[]>>
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/agent/custom-question/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete question")
      }

      setCustomQuestionItems(customQuestionItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    try {
      // Prepare updates for all questions
      // System questions have enabled/order, custom questions only have order
      const updates = [
        ...systemQuestionItems.map((q) => ({
          questionId: q.id,
          enabled: q.enabled,
          order: q.order,
        })),
        ...customQuestionItems.map((q) => ({
          questionId: q.id,
          enabled: q.enabled, // Will be ignored for custom questions but kept for consistency
          order: q.order,
        })),
      ]

      const response = await fetch("/api/agent/form-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          updates,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save form settings")
      }

      router.refresh()
    } catch (error) {
      console.error("Error saving form settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* System Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Form Questions</CardTitle>
          <CardDescription>
            Drag to reorder, toggle visibility. Core questions are required and cannot be disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, systemQuestionItems, setSystemQuestionItems)}
          >
            <SortableContext
              items={systemQuestionItems.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {systemQuestionItems.map((question) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    onToggle={(id) => handleToggle(id, systemQuestionItems, setSystemQuestionItems)}
                    isCustom={false}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Custom Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Questions</CardTitle>
              <CardDescription>
                Add your own questions to the form
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddQuestion(true)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customQuestionItems.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, customQuestionItems, setCustomQuestionItems)}
            >
              <SortableContext
                items={customQuestionItems.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {customQuestionItems.map((question) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      onToggle={(id) => handleToggle(id, customQuestionItems, setCustomQuestionItems)}
                      onDelete={handleDelete}
                      isCustom={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No custom questions yet. Click "Add Question" to create one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <AddQuestionModal
          agentId={agentId}
          onClose={() => setShowAddQuestion(false)}
          onAdd={(question) => {
            setCustomQuestionItems([
              ...customQuestionItems,
              {
                ...question,
                id: question.id,
                enabled: true,
                order: customQuestionItems.length,
                locked: false,
              },
            ])
            setShowAddQuestion(false)
          }}
        />
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}

function AddQuestionModal({
  agentId,
  onClose,
  onAdd,
}: {
  agentId: string
  onClose: () => void
  onAdd: (question: any) => void
}) {
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SHORT_TEXT)
  const [label, setLabel] = useState("")
  const [key, setKey] = useState("")
  const [required, setRequired] = useState(false)
  const [placeholder, setPlaceholder] = useState("")
  const [helpText, setHelpText] = useState("")
  const [options, setOptions] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!label || !key) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/agent/custom-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          key,
          label,
          type: questionType,
          required,
          placeholder: placeholder || undefined,
          helpText: helpText || undefined,
          options:
            questionType === QuestionType.MULTIPLE_CHOICE && options
              ? options.split("\n").map((opt) => ({
                  value: opt.trim().toLowerCase().replace(/\s+/g, "_"),
                  label: opt.trim(),
                }))
              : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create question")
      }

      const data = await response.json()
      onAdd(data.question)
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add Custom Question</CardTitle>
          <CardDescription>Create a new question for your form</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Question Label *</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="What is your preferred contact time?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Question Key *</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                placeholder="preferred_contact_time"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, underscores)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type *</Label>
              <Select
                value={questionType}
                onValueChange={(value) => setQuestionType(value as QuestionType)}
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

            {questionType === QuestionType.MULTIPLE_CHOICE && (
              <div className="space-y-2">
                <Label htmlFor="options">Options (one per line) *</Label>
                <Textarea
                  id="options"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="Morning&#10;Afternoon&#10;Evening"
                  rows={4}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Enter your answer..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText">Help Text</Label>
              <Textarea
                id="helpText"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="Additional information to help users answer..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={required}
                onCheckedChange={(checked) => setRequired(checked === true)}
              />
              <Label htmlFor="required" className="cursor-pointer">
                Required field
              </Label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
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
    </div>
  )
}

