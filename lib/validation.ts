import { z } from "zod"
import { QuestionType, USState } from "@prisma/client"

export function createQuestionSchema(questions: Array<{
  key: string
  type: string
  required: boolean
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}>) {
  const schemaObject: Record<string, z.ZodTypeAny> = {}

  for (const question of questions) {
    let fieldSchema: z.ZodString | z.ZodNumber | z.ZodBoolean

    switch (question.type) {
      case QuestionType.YES_NO:
        fieldSchema = z.boolean()
        break

      case QuestionType.NUMBER:
        let numberSchema = z.number().int()
        if (question.validation?.min !== undefined) {
          numberSchema = numberSchema.min(question.validation.min)
        }
        if (question.validation?.max !== undefined) {
          numberSchema = numberSchema.max(question.validation.max)
        }
        fieldSchema = numberSchema
        break

      case QuestionType.EMAIL:
        fieldSchema = z.string().email()
        break

      case QuestionType.PHONE:
        let phoneSchema = z.string()
        if (question.validation?.pattern) {
          const regex = new RegExp(question.validation.pattern)
          phoneSchema = phoneSchema.regex(regex, "Invalid phone format")
        }
        if (question.validation?.minLength) {
          phoneSchema = phoneSchema.min(question.validation.minLength)
        }
        fieldSchema = phoneSchema
        break

      case QuestionType.DATE:
        fieldSchema = z.string()
        break

      case QuestionType.SHORT_TEXT:
      case QuestionType.LONG_TEXT:
      case QuestionType.MULTIPLE_CHOICE:
      default:
        let stringSchema = z.string()
        if (question.validation?.minLength) {
          stringSchema = stringSchema.min(question.validation.minLength)
        }
        if (question.validation?.maxLength) {
          stringSchema = stringSchema.max(question.validation.maxLength)
        }
        if (question.validation?.pattern) {
          const regex = new RegExp(question.validation.pattern)
          stringSchema = stringSchema.regex(regex, "Invalid format")
        }
        fieldSchema = stringSchema
        break
    }

    if (question.required) {
      schemaObject[question.key] = fieldSchema
    } else {
      schemaObject[question.key] = fieldSchema.optional()
    }
  }

  return z.object(schemaObject)
}

