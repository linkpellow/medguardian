// Simple mock authentication system
// In production, replace with NextAuth.js or Clerk

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "AGENT" | "ADMIN"
}

const SESSION_COOKIE = "agent_session"

/**
 * Mock login - in production, use proper authentication
 * For now, accepts agentId to simulate logged-in agent
 */
export async function mockLogin(agentId: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  })

  if (!agent) {
    return null
  }

  // Set session cookie (in production, use secure httpOnly cookies)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, agentId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return {
    id: agent.id,
    email: agent.email,
    firstName: agent.firstName,
    lastName: agent.lastName,
    role: agent.role as "AGENT" | "ADMIN",
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value

    if (!sessionId) {
      return null
    }

    const agent = await prisma.agent.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    if (!agent) {
      return null
    }

    return {
      id: agent.id,
      email: agent.email,
      firstName: agent.firstName,
      lastName: agent.lastName,
      role: agent.role as "AGENT" | "ADMIN",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Logout user
 */
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

