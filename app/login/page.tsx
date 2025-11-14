import { redirect } from "next/navigation"
import { mockLogin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import LoginForm from "@/components/LoginForm"

// Force dynamic rendering since we access database
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Get list of agents for mock login (in production, remove this)
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    take: 20,
    orderBy: [
      { role: "asc" },
      { createdAt: "desc" },
    ],
  })

  return <LoginForm agents={agents} />
}

