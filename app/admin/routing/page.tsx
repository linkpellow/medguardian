import { requireAdmin } from "@/lib/admin"
import RoutingConfig from "@/components/RoutingConfig"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function RoutingPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Routing Strategy</h1>
        <p className="text-muted-foreground">
          Configure lead routing rules per state
        </p>
      </div>

      <RoutingConfig />
    </div>
  )
}

