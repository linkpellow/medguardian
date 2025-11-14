"use client"

import { InsuranceForm } from "@/components/InsuranceForm"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function FormContent() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agentId") || ""
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ leadId: string; agentId: string | null } | null>(null)

  if (!agentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border p-6">
          <h1 className="text-2xl font-semibold mb-4">Missing Agent ID</h1>
          <p className="text-muted-foreground">
            Please provide an agentId in the URL: /form?agentId=xyz
          </p>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border bg-card p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              Your application has been submitted successfully. An agent will contact you shortly.
            </p>
            {result.agentId && (
              <p className="text-sm text-muted-foreground">
                You will be redirected to your agent's page...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Insurance Application
          </h1>
          <p className="text-muted-foreground">
            Please fill out the form below to get started
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 sm:p-8 shadow-sm">
          <ErrorBoundary>
            <InsuranceForm
              agentId={agentId}
              onSuccess={(data) => {
                setResult(data)
                setSubmitted(true)
                // In production, redirect to agent landing page
                if (data.agentId) {
                  // setTimeout(() => {
                  //   window.location.href = `/agent/${data.agentId}`
                  // }, 2000)
                }
              }}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <FormContent />
    </Suspense>
  )
}

