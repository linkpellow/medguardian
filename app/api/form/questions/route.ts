import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { QuestionCategory } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      )
    }

    // Verify agent exists and is active
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        questionSettings: {
          include: {
            question: true,
          },
        },
        customQuestions: true,
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }

    // Get all system questions (core + optional)
    const systemQuestions = await prisma.question.findMany({
      where: {
        category: {
          in: [QuestionCategory.CORE, QuestionCategory.OPTIONAL],
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    // Get agent's question settings
    const agentSettingsMap = new Map(
      agent.questionSettings.map((setting) => [
        setting.questionId,
        setting,
      ])
    )

    // Build form questions array
    const formQuestions: Array<{
      id: string
      key: string
      label: string
      type: string
      category: string
      required: boolean
      order: number
      options?: Array<{ value: string; label: string }>
      validation?: any
      helpText?: string
      placeholder?: string
      customLabel?: string
      locked?: boolean
    }> = []

    // Process core questions (always included, locked)
    const coreQuestions = systemQuestions.filter(
      (q) => q.category === QuestionCategory.CORE
    )
    for (const question of coreQuestions) {
      const setting = agentSettingsMap.get(question.id)
      formQuestions.push({
        id: question.id,
        key: question.key,
        label: setting?.customLabel || question.label,
        type: question.type,
        category: question.category,
        required: question.required, // Core questions are always required
        order: setting?.order ?? question.order,
        options: question.options as Array<{ value: string; label: string }> | undefined,
        validation: question.validation as any,
        helpText: question.helpText || undefined,
        placeholder: question.placeholder || undefined,
        locked: true, // Core questions are locked
      })
    }

    // Process optional questions (only if enabled by agent)
    const optionalQuestions = systemQuestions.filter(
      (q) => q.category === QuestionCategory.OPTIONAL
    )
    for (const question of optionalQuestions) {
      const setting = agentSettingsMap.get(question.id)
      
      // If no setting exists, question is enabled by default
      // If setting exists, check if enabled
      if (setting && !setting.enabled) {
        continue // Skip disabled questions
      }

      formQuestions.push({
        id: question.id,
        key: question.key,
        label: setting?.customLabel || question.label,
        type: question.type,
        category: question.category,
        required: setting?.required ?? question.required,
        order: setting?.order ?? question.order,
        options: question.options as Array<{ value: string; label: string }> | undefined,
        validation: question.validation as any,
        helpText: question.helpText || undefined,
        placeholder: question.placeholder || undefined,
        locked: false,
      })
    }

    // Process custom questions
    for (const customQuestion of agent.customQuestions) {
      formQuestions.push({
        id: customQuestion.id,
        key: customQuestion.key,
        label: customQuestion.label,
        type: customQuestion.type,
        category: QuestionCategory.CUSTOM,
        required: customQuestion.required,
        order: customQuestion.order,
        options: customQuestion.options as Array<{ value: string; label: string }> | undefined,
        validation: customQuestion.validation as any,
        helpText: customQuestion.helpText || undefined,
        placeholder: customQuestion.placeholder || undefined,
        locked: false,
      })
    }

    // Sort by order
    formQuestions.sort((a, b) => a.order - b.order)

    // Group into steps (you can customize this logic)
    // For now, let's create logical steps:
    // Step 1: Personal Info (name, contact, location)
    // Step 2: Demographics (DOB, gender, household info)
    // Step 3: Insurance Details (coverage, preferences)
    // Step 4: Health & Lifestyle (tobacco, medications)
    // Step 5: Additional Info (custom questions, employment)

    const steps = [
      {
        step: 1,
        title: "Personal Information",
        questions: formQuestions.filter((q) =>
          ["first_name", "last_name", "phone", "email", "zip", "state"].includes(q.key)
        ),
      },
      {
        step: 2,
        title: "Demographics",
        questions: formQuestions.filter((q) =>
          ["dob", "gender", "people_needing_coverage", "household_income", "family_size"].includes(q.key)
        ),
      },
      {
        step: 3,
        title: "Insurance Preferences",
        questions: formQuestions.filter((q) =>
          [
            "coverage_start_preference",
            "current_coverage",
            "deductible_preference",
            "carrier_preference",
            "dental_vision_preference",
          ].includes(q.key)
        ),
      },
      {
        step: 4,
        title: "Health & Lifestyle",
        questions: formQuestions.filter((q) =>
          ["tobacco_use", "medications"].includes(q.key)
        ),
      },
      {
        step: 5,
        title: "Additional Information",
        questions: formQuestions.filter((q) =>
          !["first_name", "last_name", "phone", "email", "zip", "state", "dob", "gender", "people_needing_coverage", "household_income", "family_size", "coverage_start_preference", "current_coverage", "deductible_preference", "carrier_preference", "dental_vision_preference", "tobacco_use", "medications"].includes(q.key)
        ),
      },
    ].filter((step) => step.questions.length > 0) // Remove empty steps

    return NextResponse.json({ steps })
  } catch (error) {
    console.error("Error fetching form questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch form questions" },
      { status: 500 }
    )
  }
}

