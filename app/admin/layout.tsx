import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin"
import AdminNav from "@/components/AdminNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const user = await requireAdmin()
    return (
      <div className="min-h-screen bg-background">
        <AdminNav user={user} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}

