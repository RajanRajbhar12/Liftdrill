import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// Function to create a server-side Supabase client for use in Server Components and Actions
// For Server Components and Actions, the cookies() object is implicitly used by createServerClient.
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          const cookieStore = await cookies()
          return Array.from(cookieStore.getAll()).map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            options: {
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax'
            }
          }))
        },
        setAll: async (cookieList) => {
          const cookieStore = await cookies()
          cookieList.forEach(cookie => {
            try {
              cookieStore.set({
                name: cookie.name,
                value: cookie.value,
                ...cookie.options
              })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          })
        }
      }
    }
  )
} 