import { getCurrentUser } from "./auth"

/**
 * Check if current user is an admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required")
  }

  return user
}

