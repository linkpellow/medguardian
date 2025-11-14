import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("agent_session")

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("agent_session")

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Role check will be done in the route handler
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}

