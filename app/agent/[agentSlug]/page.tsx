import { Suspense } from "react"
import AgentLandingPage from "@/components/AgentLandingPage"

export default function AgentPage({
  params,
}: {
  params: Promise<{ agentSlug: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <AgentLandingPageWrapper params={params} />
    </Suspense>
  )
}

async function AgentLandingPageWrapper({
  params,
}: {
  params: Promise<{ agentSlug: string }>
}) {
  const { agentSlug } = await params
  return <AgentLandingPage agentSlug={agentSlug} />
}

