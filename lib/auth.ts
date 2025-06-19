"use server"

import { createClient } from "@/lib/supabase/client"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const supabase = createClient()

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const fullName = formData.get("name") as string

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
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

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create account" }
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          username,
          full_name: fullName,
          email,
          avatar_url: null,
          bio: null,
          total_earnings: 0,
          challenges_won: 0,
          challenges_created: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Don't return error here as the user is already created in auth
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error("Error in signUp:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
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

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "Invalid email or password" }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Error in signIn:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
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
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getUserDetails() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
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
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    return profile
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
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

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }

  redirect('/')
}

// Client-side version of getCurrentUser
export async function getClientCurrentUser() {
  const supabase = createClient()
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error("Error getting user:", userError)
      return null
    }

    if (!user) {
      console.log("No authenticated user found")
      return null
    }

    return user
  } catch (error: any) {
    console.error("Error in getClientCurrentUser:", error)
    return null
  }
}

// Server-side version of getCurrentUser (for server components and actions)
export async function getCurrentUser() {
  "use server"
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error("Error getting user:", userError)
      return null
    }

    if (!user) {
      console.log("No authenticated user found")
      return null
    }

    return user
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function requireAuth() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect("/auth/login")
    }
    return user
  } catch (error) {
    console.error("Authentication required:", error)
    redirect("/auth/login")
  }
}

export async function requireAdmin() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect("/auth/login")
    }

    // Fetch user profile to check for admin status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      redirect("/auth/login")
    }

    return user

  } catch (error) {
    console.error("Admin authentication required:", error)
    redirect("/auth/login")
  }
}

export async function getUserProfile(userId: string) {
  try {
    // Get user data
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    // Get user submissions count
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (submissionsError) throw submissionsError

    // Get user challenges count
    const { count: challengesCount, error: challengesError } = await supabase
      .from("challenges")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId)

    if (challengesError) throw challengesError

    return {
      ...user,
      submissions_count: submissionsCount || 0,
      created_challenges_count: challengesCount || 0,
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Client-side auth functions
export async function getClientSession() {
  const supabase = createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function getClientUserDetails() {
  const supabase = createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    return profile
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function clientSignOut() {
  const supabase = createClient()
  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error }
  }
}

export async function getUserById(userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    return null
  }

  return profile
}

