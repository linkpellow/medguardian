import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import ProfileEditor from "@/components/ProfileEditor"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch agent profile data
  const agent = await prisma.agent.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
    },
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Update your profile information and branding
        </p>
      </div>

      <ProfileEditor agent={agent} />
    </div>
  )
}

