"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Users, FileText, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminNavProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: BarChart3,
    },
    {
      href: "/admin/agents",
      label: "Agents",
      icon: Users,
    },
    {
      href: "/admin/questions",
      label: "Questions",
      icon: FileText,
    },
    {
      href: "/admin/routing",
      label: "Routing",
      icon: Settings,
    },
    {
      href: "/admin/leads",
      label: "Lead Logs",
      icon: BarChart3,
    },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

