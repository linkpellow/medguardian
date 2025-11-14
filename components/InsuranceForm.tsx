"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trackFormStart, trackFormStep, trackFormSubmit } from "@/lib/analytics"
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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FormQuestion, FormStep } from "@/types/form"
import { QuestionType } from "@prisma/client"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface InsuranceFormProps {
  agentId: string
  onSuccess?: (data: { leadId: string; agentId: string | null }) => void
}

export function InsuranceForm({ agentId, onSuccess }: InsuranceFormProps) {
  const [steps, setSteps] = useState<FormStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch form questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/form/questions?agentId=${agentId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch questions")
        }
        const data = await response.json()
        setSteps(data.steps)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    if (agentId) {
      fetchQuestions()
      trackFormStart(agentId)
    }
  }, [agentId])

  // Build validation schema from all questions
  const allQuestions = steps.flatMap((step) => step.questions)
  const schema = z.object(
    allQuestions.reduce((acc, q) => {
      let fieldSchema: z.ZodTypeAny

      switch (q.type) {
        case QuestionType.YES_NO:
          fieldSchema = z.boolean()
          break
        case QuestionType.NUMBER:
          let numberSchema = z.coerce.number().int()
          if (q.validation?.min !== undefined) {
            numberSchema = numberSchema.min(q.validation.min)
          }
          if (q.validation?.max !== undefined) {
            numberSchema = numberSchema.max(q.validation.max)
          }
          fieldSchema = numberSchema
          break
        case QuestionType.EMAIL:
          fieldSchema = z.string().email()
          break
        case QuestionType.PHONE:
          let phoneSchema = z.string()
          if (q.validation?.pattern) {
            const regex = new RegExp(q.validation.pattern)
            phoneSchema = phoneSchema.regex(regex, "Invalid phone format")
          }
          if (q.validation?.minLength) {
            phoneSchema = phoneSchema.min(q.validation.minLength)
          }
          fieldSchema = phoneSchema
          break
        case QuestionType.DATE:
          fieldSchema = z.string()
          break
        default:
          let stringSchema = z.string()
          if (q.validation?.minLength) {
            stringSchema = stringSchema.min(q.validation.minLength)
          }
          if (q.validation?.maxLength) {
            stringSchema = stringSchema.max(q.validation.maxLength)
          }
          if (q.validation?.pattern) {
            const regex = new RegExp(q.validation.pattern)
            stringSchema = stringSchema.regex(regex, "Invalid format")
          }
          fieldSchema = stringSchema
          break
      }

      if (q.required) {
        acc[q.key] = fieldSchema
      } else {
        acc[q.key] = fieldSchema.optional()
      }

      return acc
    }, {} as Record<string, z.ZodTypeAny>)
  )

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    const currentStepQuestions = currentStepData?.questions || []
    const fieldsToValidate = currentStepQuestions.map((q) => q.key)
    
    const isValid = await trigger(fieldsToValidate as any)
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      trackFormStep(agentId, currentStep + 2)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    setError(null)

    try {
      // Separate custom answers
      const customAnswers: Record<string, any> = {}
      const standardFields: Record<string, any> = {}

      allQuestions.forEach((q) => {
        if (q.category === "CUSTOM") {
          if (data[q.key] !== undefined) {
            customAnswers[q.key] = data[q.key]
          }
        } else {
          standardFields[q.key] = data[q.key]
        }
      })

      const payload = {
        ...standardFields,
        customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
        agentId,
      }

      const response = await fetch("/api/lead/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit form")
      }

      const result = await response.json()
      
      // Track form submission
      trackFormSubmit(agentId, result.lead.id)
      
      // Redirect to agent's landing page if URL is provided
      if (result.redirect?.url) {
        // Call success callback first
        if (onSuccess) {
          onSuccess({
            leadId: result.lead.id,
            agentId: result.redirect.agentId,
          })
        }
        // Redirect after a short delay to show success message
        setTimeout(() => {
          window.location.href = result.redirect.url
        }, 2000)
      } else if (onSuccess) {
        // No redirect URL, just call success callback
        onSuccess({
          leadId: result.lead.id,
          agentId: result.lead.agentId,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (question: FormQuestion) => {
    const fieldName = question.key
    const isRequired = question.required
    const hasError = !!errors[fieldName]

    return (
      <div key={question.id} className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm font-medium">
          {question.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
          {question.locked && (
            <span className="text-muted-foreground text-xs ml-2">(Required)</span>
          )}
        </Label>

        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => {
            switch (question.type) {
              case QuestionType.YES_NO:
                return (
                  <RadioGroup
                    value={field.value === true ? "yes" : field.value === false ? "no" : ""}
                    onValueChange={(value) => field.onChange(value === "yes")}
                    className="flex flex-row gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${fieldName}-yes`} />
                      <Label htmlFor={`${fieldName}-yes`} className="cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${fieldName}-no`} />
                      <Label htmlFor={`${fieldName}-no`} className="cursor-pointer">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                )

              case QuestionType.MULTIPLE_CHOICE:
                return (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={hasError ? "border-destructive" : ""}>
                      <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )

              case QuestionType.NUMBER:
                return (
                  <Input
                    {...field}
                    type="number"
                    id={fieldName}
                    placeholder={question.placeholder}
                    value={field.value ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                    min={question.validation?.min}
                    max={question.validation?.max}
                  />
                )

              case QuestionType.DATE:
                return (
                  <Input
                    {...field}
                    type="date"
                    id={fieldName}
                    value={field.value ? String(field.value) : ""}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                    max={question.validation?.max}
                  />
                )

              case QuestionType.EMAIL:
                return (
                  <Input
                    {...field}
                    type="email"
                    id={fieldName}
                    placeholder={question.placeholder}
                    value={field.value ? String(field.value) : ""}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                  />
                )

              case QuestionType.PHONE:
                return (
                  <Input
                    {...field}
                    type="tel"
                    id={fieldName}
                    placeholder={question.placeholder}
                    value={field.value ? String(field.value) : ""}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                  />
                )

              case QuestionType.LONG_TEXT:
                return (
                  <Textarea
                    {...field}
                    id={fieldName}
                    placeholder={question.placeholder}
                    value={field.value ? String(field.value) : ""}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                    rows={4}
                  />
                )

              default:
                return (
                  <Input
                    {...field}
                    type="text"
                    id={fieldName}
                    placeholder={question.placeholder}
                    value={field.value ? String(field.value) : ""}
                    className={hasError ? "border-destructive" : ""}
                    disabled={question.locked}
                  />
                )
            }
          }}
        />

        {question.helpText && (
          <p className="text-xs text-muted-foreground">{question.helpText}</p>
        )}

        {hasError && (
          <p className="text-xs text-destructive">
            {errors[fieldName]?.message as string}
          </p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && steps.length === 0) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">No form questions available.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{currentStepData.title}</h2>
        <p className="text-sm text-muted-foreground">
          Please provide the following information
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 mb-8">
        {currentStepData.questions.map((question) => renderField(question))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || submitting}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isLastStep ? (
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-[#F5C242] hover:bg-[#F5C242]/90 text-[#0B294B] font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </form>
  )
}

