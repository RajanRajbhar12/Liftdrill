import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return Array.from(request.cookies.getAll()).map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll: (cookies) => {
          // Set cookies on the response
          cookies.forEach((cookie) => {
            response.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options,
              // Ensure cookies are secure and httpOnly in production
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax',
              path: '/',
            })
          })
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Auth routes handling
    if (request.nextUrl.pathname.startsWith("/auth")) {
      if (session) {
        // If user is logged in and tries to access auth pages, redirect to profile
        return NextResponse.redirect(new URL("/profile", request.url))
      }
      return response
    }

    // Protected routes handling
    if (
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/challenges/create") ||
      request.nextUrl.pathname.startsWith("/wallet") ||
      request.nextUrl.pathname.startsWith("/settings")
    ) {
      if (!session) {
        // If user is not logged in and tries to access protected pages, redirect to login
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login to be safe
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/profile/:path*",
    "/challenges/create/:path*",
    "/wallet/:path*",
    "/settings/:path*",
  ],
}
