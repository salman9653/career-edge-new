import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Retrieve Better Auth session token cookies (support both HTTP and HTTPS/Secure cookies)
  const devToken = request.cookies.get("better-auth.session_token")?.value
  const prodToken = request.cookies.get("__Secure-better-auth.session_token")?.value
  const hasSession = !!(devToken || prodToken)

  // Route groupings
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname.startsWith("/signin") || pathname.startsWith("/signup")

  // Case 1: Unauthenticated request to a protected route -> redirect to signin
  if (isProtectedRoute && !hasSession) {
    const url = new URL("/signin", request.url)
    // Persist callback URL if desirable, e.g. for deep linking
    url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // Case 2: Authenticated request attempting to visit login/signup pages -> redirect to dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Proceed with the request
  return NextResponse.next()
}

export const config = {
  // Run proxy for dashboard, signin, and signup routes
  matcher: ["/dashboard/:path*", "/signin", "/signup/:path*"],
}
