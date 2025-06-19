"use server"

import { revalidatePath } from "next/cache"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getCurrentUser } from "./auth"
import { supabase } from "./supabase"
import { createClient } from "@/lib/supabase/server"
import { User } from "@supabase/supabase-js"

// Define necessary types used in this file
interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  total_earnings: number;
  challenges_won: number;
  challenges_created: number;
  created_at: string;
  updated_at: string;
  // Add other profile fields as needed
}

interface Transaction {
  id: string;
  user_id: string;
  challenge_id: string;
  type: "entry_fee" | "prize" | "refund";
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  challenge?: { // Optional challenge details if joined
    title: string;
    // Add other challenge fields if needed
  };
  submission?: { // Optional submission details if joined
    id: string;
    // Add other submission fields if needed
  };
}

// Server-side Supabase client creation helper for Actions and other server functions
const getSupabaseServerActionClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
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
}

export async function getChallenges() {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client.from("challenges").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Error fetching challenges:", error)
    return []
  }
}

export async function getChallenge(id: string) {
  try {
    // Check if the ID is a valid format (basic validation)
    if (!id || id.length < 1 || id === "create" || id === "new") {
      return null
    }

    const client = await getSupabaseServerActionClient()
    const { data, error } = await client.from("challenges").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching challenge:", error)
      return null
    }
    return data
  } catch (error: any) {
    console.error("Error fetching challenge:", error)
    return null
  }
}

export async function createChallenge(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const longDescription = formData.get("longDescription") as string
  const category = formData.get("category") as string
  const entryFee = Number(formData.get("entryFee") as string)
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const maxParticipants = formData.get("maxParticipants") as string
  const scoringMethod = formData.get("scoringMethod") as string
  const videoDurationLimit = Number(formData.get("videoDurationLimit") as string)
  const prizeDistribution = formData.get("prizeDistribution") as string
  const isPublic = formData.get("isPublic") === "true"
  let rules: string[] = []
  
  try {
    const rulesStr = formData.get("rules") as string
    if (rulesStr) {
      rules = JSON.parse(rulesStr)
    }
  } catch (error) {
    console.error("Error parsing rules:", error)
    // If parsing fails, try to split by newlines as fallback
    const rulesStr = formData.get("rules") as string
    if (rulesStr) {
      rules = rulesStr.split("\n").filter(rule => rule.trim() !== "")
    }
  }

  try {
    const client = await getSupabaseServerActionClient()
    const { data: user } = await client.auth.getUser()
    
    if (!user?.user?.id) {
      throw new Error("User must be authenticated to create a challenge")
    }

    // Create challenge with all details
    const { data, error } = await client
      .from("challenges")
      .insert([
        {
          title,
          description,
          long_description: longDescription,
          category,
          entry_fee: entryFee,
          prize_pool: 0, // Initial prize pool is 0, will be updated by triggers
          participants_count: 0,
          status: "active",
          start_date: startDate,
          end_date: endDate,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          scoring_method: scoringMethod,
          video_duration_limit: videoDurationLimit,
          prize_distribution: prizeDistribution,
          is_public: isPublic,
          rules,
          created_by: user.user.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Create a transaction record for the platform fee (if any)
    if (entryFee > 0) {
      const platformFee = Math.round(entryFee * 0.1) // 10% platform fee
      const { error: transactionError } = await client
        .from("transactions")
        .insert([
          {
            user_id: user.user.id,
            challenge_id: data.id,
            type: "entry_fee",
            amount: entryFee - platformFee, // Net amount after platform fee
            status: "completed",
          },
        ])

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)
        // Don't throw error here as the challenge was created successfully
      }
    }

    revalidatePath("/challenges")
    return data
  } catch (error: any) {
    console.error("Error creating challenge:", error)
    throw new Error(error.message || "Failed to create challenge")
  }
}

export async function joinChallenge(challengeId: string, userIdFromClient?: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get current user
    const { data: { user: currentUser }, error: userError } = await client.auth.getUser()
    if (userError || !currentUser) {
      console.error("Error getting current user:", userError)
      return { success: false, error: "User not authenticated" }
    }

    // Use provided userId or current user's id
    const userId = userIdFromClient || currentUser.id

    // Check if user is already a participant
    const { data: existingParticipant, error: checkError } = await client
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking participant status:", checkError)
      return { success: false, error: "Failed to check participant status" }
    }

    if (existingParticipant) {
      console.log("User is already a participant")
      return { success: false, error: "Already participating in this challenge" }
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await client
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single()

    if (challengeError || !challenge) {
      console.error("Error fetching challenge:", challengeError)
      return { success: false, error: "Challenge not found" }
    }

    // Check user's wallet balance
    const { data: wallet, error: walletError } = await client
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single()

    if (walletError) {
      console.error("Error checking wallet balance:", walletError)
      return { success: false, error: "Failed to check wallet balance" }
    }

    if (!wallet || wallet.balance < challenge.entry_fee) {
      return { success: false, error: "Insufficient wallet balance" }
    }

    // Start a transaction
    const { error: transactionError } = await client.rpc('begin_transaction')

    try {
      // Deduct from wallet
      const { error: walletUpdateError } = await client
        .from("wallets")
        .update({ balance: wallet.balance - challenge.entry_fee })
        .eq("user_id", userId)

      if (walletUpdateError) throw walletUpdateError

      // Create payment record
      const { error: paymentError } = await client
        .from("payments")
        .insert([
          {
            user_id: userId,
            challenge_id: challengeId,
            amount: challenge.entry_fee,
            status: "completed",
            payment_provider: "platform",
            payment_id: `entry_${Date.now()}`,
          },
        ])

      if (paymentError) throw paymentError

      // Add user as participant
      const { error: joinError } = await client
        .from("challenge_participants")
        .insert([
          {
            challenge_id: challengeId,
            user_id: userId,
            payment_status: "completed",
            payment_id: `entry_${Date.now()}`,
            joined_at: new Date().toISOString(),
          },
        ])

      if (joinError) throw joinError

      // Create transaction record
      const platformFee = Math.round(challenge.entry_fee * 0.1) // 10% platform fee
      const { error: transactionRecordError } = await client
        .from("transactions")
        .insert([
          {
            user_id: userId,
            challenge_id: challengeId,
            type: "entry_fee",
            amount: challenge.entry_fee - platformFee, // Net amount after platform fee
            status: "completed",
          },
        ])

      if (transactionRecordError) throw transactionRecordError

      // Commit the transaction
      await client.rpc('commit_transaction')

      return { success: true }
    } catch (error) {
      // Rollback on error
      await client.rpc('rollback_transaction')
      throw error
    }
  } catch (error: any) {
    console.error("Error joining challenge:", error)
    return { success: false, error: error.message || "Failed to join challenge" }
  }
}

export async function hasSubmittedVideo(challengeId: string, userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("submissions")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .not("status", "eq", "rejected") // Consider non-rejected submissions as 'submitted'
      .maybeSingle()

    if (error) throw error

    return data !== null // Returns true if a non-rejected submission exists, false otherwise
  } catch (error: any) {
    console.error("Error checking submission status:", error.message)
    // In case of an error, assume they haven't submitted to be safe
    return false
  }
}

export async function submitVideo(formData: FormData) {
  const challengeId = formData.get("challengeId") as string
  const score = formData.get("score") as string
  const notes = formData.get("notes") as string
  const videoFile = formData.get("video") as File

  if (!videoFile) {
    throw new Error("No video file provided.")
  }

  // Get authenticated user
  const client = await getSupabaseServerActionClient()

  const { data: { user }, error: userError } = await client.auth.getUser()

  if (userError || !user) {
    throw new Error("User not authenticated.")
  }
  const userId = user.id

  try {
    // Upload video to Supabase Storage
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `submission-videos/${fileName}`

    const { error: uploadError } = await client.storage
      .from('submission-videos')
      .upload(filePath, videoFile)

    if (uploadError) {
      console.error("Error uploading video:", uploadError)
      throw new Error(`Failed to upload video: ${uploadError.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from('submission-videos')
      .getPublicUrl(filePath)

    const videoUrl = publicUrlData.publicUrl

    // Insert submission record into database
    const { data, error } = await client
      .from("submissions")
      .insert([
        {
          challenge_id: challengeId,
          user_id: userId,
          score,
          notes,
          video_url: videoUrl,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/challenges/${challengeId}`)
    return { success: true, submissionId: data.id }
  } catch (error: any) {
    console.error("Error submitting video:", error)
    throw new Error(`Failed to submit video: ${error.message}`)
  }
}

export async function processPayment(amount: number, challengeId: string) {
  // Simulate payment processing
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // In production, integrate with payment gateway like Razorpay for India
  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount: amount * 100, // Convert to paise (smallest unit)
    currency: "inr",
    status: "succeeded",
  }

  return { success: true, paymentIntent }
}

export async function getSubmissions(challengeId?: string) {
  try {
    const client = await getSupabaseServerActionClient()
    let query = client
      .from("submissions")
      .select(`
        *,
        user:profiles(username, full_name, avatar_url),
        challenge:challenges(title, prize_pool)
      `)
      .order("submitted_at", { ascending: false })

    if (challengeId) {
      query = query.eq("challenge_id", challengeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Error fetching submissions:", error)
    return []
  }
}

export async function getUserSubmissions(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("submissions")
      .select(`
        *,
        challenge:challenges(title, prize_pool)
      `)
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Error fetching user submissions:", error)
    return []
  }
}

export async function approveSubmission(submissionId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Error approving submission:", error)
    return { success: false, error: "Failed to approve submission" }
  }
}

export async function rejectSubmission(submissionId: string, reason: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("submissions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error rejecting submission:", error);
    return { success: false, error: "Failed to reject submission" };
  }
}

export async function getAllUsers() {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        email,
        avatar_url,
        bio,
        total_earnings,
        challenges_won,
        challenges_created,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Helper function to get or create test user
export async function getTestUser() {
  const testUserId = "123e4567-e89b-12d3-a456-426614174000"

  try {
    const client = await getSupabaseServerActionClient()
    const { data: profile, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", testUserId)
      .single()

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it with all required fields
      const { data: newProfile, error: createError } = await client
        .from("profiles")
        .insert([
          {
            id: testUserId,
            username: "testuser",
            full_name: "Test User",
            email: "test@example.com",
            avatar_url: null,
            bio: "Test account",
            total_earnings: 0,
            challenges_won: 0,
            challenges_created: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating test profile:", createError)
        throw createError
      }
      return newProfile
    }

    if (error) {
      console.error("Error fetching test profile:", error)
      throw error
    }
    return profile
  } catch (error: any) {
    console.error("Error with test profile:", error)
    return null
  }
}

// Function to update a challenge
export async function updateChallenge(id: string, newData: any) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("challenges")
      .update(newData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/challenges"); // Revalidate the admin challenges page
    revalidatePath("/challenges"); // Also revalidate the public challenges page
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating challenge:", error);
    return { success: false, error: "Failed to update challenge" };
  }
}

// Function to delete a challenge
export async function deleteChallenge(id: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { error } = await client
      .from("challenges")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/challenges"); // Revalidate the admin challenges page
    revalidatePath("/challenges"); // Also revalidate the public challenges page
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting challenge:", error);
    return { success: false, error: "Failed to delete challenge" };
  }
}

// Function to get all payments
export async function getPayments() {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client.from("payments").select("*").order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching payments:", error.message);
    return [];
  }
}

// User Profile Actions
export async function updateProfile(formData: FormData) {
  try {
    const client = await getSupabaseServerActionClient()
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new Error("Not authenticated")
    }

    const { error } = await client
      .from("profiles")
      .update({
        username: formData.get("username"),
        full_name: formData.get("fullName"),
        bio: formData.get("bio"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentUser.id)

    if (error) throw error

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("profiles")
      .select(`
        *,
        challenges:challenges(count),
        submissions:submissions(count)
      `)
      .eq("id", userId)
      .single()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/users")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message }
  }
}

// Scoring and Validation Functions
export async function validateSubmission(submissionId: string, validationData: {
  score: number;
  formScore: number;
  repCount: number;
  notes: string;
  isApproved: boolean;
}) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data: submission, error: fetchError } = await client
      .from("submissions")
      .select(`
        *,
        challenge:challenges(
          id,
          title,
          prize_pool,
          participants_count,
          entry_fee
        )
      `)
      .eq("id", submissionId)
      .single()

    if (fetchError) throw fetchError

    // Calculate final score (weighted average of form and rep count)
    const finalScore = (validationData.formScore * 0.6) + (validationData.repCount * 0.4)

    // Update submission with validation results
    const { data: updatedSubmission, error: updateError } = await client
      .from("submissions")
      .update({
        status: validationData.isApproved ? "approved" : "rejected",
        score: finalScore,
        form_score: validationData.formScore,
        rep_count: validationData.repCount,
        validation_notes: validationData.notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (updateError) throw updateError

    // If approved, update challenge leaderboard
    if (validationData.isApproved) {
      await updateChallengeLeaderboard(submission.challenge.id)
    }

    return { success: true, data: updatedSubmission }
  } catch (error: any) {
    console.error("Error validating submission:", error)
    return { success: false, error: error.message }
  }
}

async function updateChallengeLeaderboard(challengeId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get all approved submissions for this challenge
    const { data: submissions, error: fetchError } = await client
      .from("submissions")
      .select(`
        *,
        user:profiles(id, username, full_name)
      `)
      .eq("challenge_id", challengeId)
      .eq("status", "approved")
      .order("score", { ascending: false })

    if (fetchError) throw fetchError

    // Update leaderboard
    const { error: updateError } = await client
      .from("challenge_leaderboards")
      .upsert(
        submissions.map((sub, index) => ({
          challenge_id: challengeId,
          user_id: sub.user.id,
          score: sub.score,
          rank: index + 1,
          updated_at: new Date().toISOString()
        }))
      )

    if (updateError) throw updateError

    // If challenge is ended, process winners
    const { data: challenge, error: challengeError } = await client
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single()

    if (challengeError) throw challengeError

    if (challenge.status === "ended" && submissions.length > 0) {
      await processChallengeWinners(challenge, submissions)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating leaderboard:", error)
    return { success: false, error: error.message }
  }
}

async function processChallengeWinners(challenge: any, submissions: any[]) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Calculate prize distribution
    const totalPool = challenge.prize_pool
    const platformFee = totalPool * 0.2 // 20% platform fee
    const remainingPool = totalPool - platformFee

    // Define prize distribution (e.g., 50% for 1st, 30% for 2nd, 20% for 3rd)
    const prizeDistribution = [0.5, 0.3, 0.2]
    const winners = submissions.slice(0, 3) // Top 3 winners

    // Process each winner
    for (let i = 0; i < winners.length; i++) {
      const prizeAmount = remainingPool * prizeDistribution[i]
      
      // Update user's earnings and balance
      const { error: updateError } = await client
        .from("profiles")
        .update({
          total_earnings: client.rpc('increment', { x: prizeAmount }),
          challenges_won: client.rpc('increment', { x: 1 }),
          balance: client.rpc('increment', { x: prizeAmount }) // Add prize amount to balance
        })
        .eq("id", winners[i].user.id)

      if (updateError) throw updateError

      // Record the payout
      const { error: payoutError } = await client
        .from("payouts")
        .insert({
          challenge_id: challenge.id,
          user_id: winners[i].user.id,
          amount: prizeAmount,
          rank: i + 1,
          status: "pending", // Will be updated when payment is processed
          created_at: new Date().toISOString()
        })

      if (payoutError) throw payoutError
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error processing winners:", error)
    return { success: false, error: error.message }
  }
}

// Gamification System
export async function getLevelProgress(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data: profile, error } = await client
      .from("profiles")
      .select("level, xp")
      .eq("id", userId)
      .single()

    if (error) throw error

    const currentLevel = profile.level || 1
    const currentXP = profile.xp || 0
    const xpForNextLevel = currentLevel * 1000
    const progress = (currentXP % 1000) / 10

    return {
      success: true,
      data: {
        currentLevel,
        currentXP,
        xpForNextLevel,
        progress
      }
    }
  } catch (error: any) {
    console.error("Error getting level progress:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserBadges(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("user_badges")
      .select("*")
      .eq("user_id", userId)
      .order("awarded_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Error getting user badges:", error)
    return { success: false, error: error.message }
  }
}

// Transaction System
export async function createTransaction(data: {
  userId: string;
  challengeId: string;
  type: "entry_fee" | "prize" | "refund";
  amount: number;
}) {
  try {
    const client = await getSupabaseServerActionClient()
    const { data: transaction, error } = await client
      .from("transactions")
      .insert({
        user_id: data.userId,
        challenge_id: data.challengeId,
        type: data.type,
        amount: data.amount,
        status: "pending"
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data: transaction }
  } catch (error: any) {
    console.error("Error creating transaction:", error)
    return { success: false, error: error.message }
  }
}

export async function processPayout(payoutId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get payout details
    const { data: payout, error: payoutError } = await client
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single()

    if (payoutError) throw payoutError

    // Update payout status
    const { error: updateError } = await client
      .from("payouts")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", payoutId)

    if (updateError) throw updateError

    // Create transaction record
    await createTransaction({
      userId: payout.user_id,
      challengeId: payout.challenge_id,
      type: "prize",
      amount: payout.amount
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error processing payout:", error)
    return { success: false, error: error.message }
  }
}

// Challenge Templates
export async function getChallengeTemplates() {
  try {
    const client = await getSupabaseServerActionClient()
    const { data, error } = await client
      .from("challenge_templates")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Error getting challenge templates:", error)
    return { success: false, error: error.message }
  }
}

export async function createChallengeFromTemplate(templateId: string, customizations: {
  title?: string;
  description?: string;
  entry_fee?: number;
  end_date?: string;
}) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get template
    const { data: template, error: templateError } = await client
      .from("challenge_templates")
      .select("*")
      .eq("id", templateId)
      .single()

    if (templateError) throw templateError

    // Create challenge from template
    const { data: challenge, error: challengeError } = await client
      .from("challenges")
      .insert({
        ...template,
        ...customizations,
        created_at: new Date().toISOString(),
        status: "scheduled"
      })
      .select()
      .single()

    if (challengeError) throw challengeError

    return { success: true, data: challenge }
  } catch (error: any) {
    console.error("Error creating challenge from template:", error)
    return { success: false, error: error.message }
  }
}

// Transaction History
export async function getUserTransactions(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    const { data, error } = await client
      .from("transactions")
      .select(`
        *,
        challenge:challenges(title)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching user transactions:", error)
    return { success: false, error: error.message }
  }
}

// Wallet Balance
export async function getUserBalance(userId: string) {
  try {
    const client = await getSupabaseServerActionClient();

    // Sum completed prize and refund amounts, subtract completed entry fees
    const { data, error } = await client
      .from("transactions")
      .select('type, amount, status')
      .eq("user_id", userId);

    if (error) throw error;

    const balance = (data || []).reduce((sum, transaction) => {
      if (transaction.status === 'completed') {
        if (transaction.type === 'prize' || transaction.type === 'refund') {
          return sum + parseFloat(transaction.amount as any);
        } else if (transaction.type === 'entry_fee') {
          return sum - parseFloat(transaction.amount as any);
        }
      }
      return sum; // Ignore other statuses or types
    }, 0);

    return { success: true, balance };

  } catch (error: any) {
    console.error("Error fetching user balance:", error);
    return { success: false, error: error.message, balance: 0 };
  }
}

// Gamification System
export async function awardXP(userId: string, amount: number, reason: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Update user's XP and streak
    const { data: user, error: userError } = await client
      .from("profiles")
      .update({
        xp: client.rpc('increment', { x: amount }),
        streak_count: client.rpc('increment', { x: 1 }),
        last_activity: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) throw userError

    // Record XP transaction
    const { error: xpError } = await client
      .from("xp_transactions")
      .insert({
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString()
      })

    if (xpError) throw xpError

    // Check for level up
    const newLevel = Math.floor(user.xp / 1000) // 1000 XP per level
    if (newLevel > user.level) {
      await client
        .from("profiles")
        .update({ level: newLevel })
        .eq("id", userId)

      // Award level up badge
      await awardBadge(userId, `level_${newLevel}`)
    }

    return { success: true, data: user }
  } catch (error: any) {
    console.error("Error awarding XP:", error)
    return { success: false, error: error.message }
  }
}

export async function awardBadge(userId: string, badgeType: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Check if user already has this badge
    const { data: existingBadge } = await client
      .from("user_badges")
      .select("*")
      .eq("user_id", userId)
      .eq("badge_type", badgeType)
      .single()

    if (existingBadge) return { success: true }

    // Award new badge
    const { error } = await client
      .from("user_badges")
      .insert({
        user_id: userId,
        badge_type: badgeType,
        awarded_at: new Date().toISOString()
      })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error awarding badge:", error)
    return { success: false, error: error.message }
  }
}

// Referral System
export async function generateReferralCode(userId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Generate unique referral code
    const code = `${userId.slice(0, 4)}-${Math.random().toString(36).substring(2, 6)}`
    
    // Store referral code
    const { error } = await client
      .from("referral_codes")
      .insert({
        user_id: userId,
        code,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    return { success: true, code }
  } catch (error: any) {
    console.error("Error generating referral code:", error)
    return { success: false, error: error.message }
  }
}

export async function processReferral(referralCode: string, newUserId: string) {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get referral code details
    const { data: referral, error: referralError } = await client
      .from("referral_codes")
      .select("*")
      .eq("code", referralCode)
      .single()

    if (referralError) throw referralError

    // Check if referral code is valid and unused
    if (!referral || referral.used_by) {
      throw new Error("Invalid or used referral code")
    }

    // Award referral bonus to referrer
    await awardXP(referral.user_id, 500, "Referral bonus")
    
    // Award welcome bonus to new user
    await awardXP(newUserId, 200, "Welcome bonus")

    // Mark referral code as used
    const { error: updateError } = await client
      .from("referral_codes")
      .update({
        used_by: newUserId,
        used_at: new Date().toISOString()
      })
      .eq("code", referralCode)

    if (updateError) throw updateError

    return { success: true }
  } catch (error: any) {
    console.error("Error processing referral:", error)
    return { success: false, error: error.message }
  }
}

// Wallet Operations
export async function addFundsToWallet(amount: number) {
  try {
    const client = await getSupabaseServerActionClient();
    const currentUser = await client.auth.getUser();

    if (!currentUser.data.user) {
      throw new Error("User not authenticated.");
    }
    const userId = currentUser.data.user.id;

    if (amount <= 0) {
      throw new Error("Amount must be positive.");
    }

    // Simulate payment success (replace with actual payment gateway callback logic)

    // Record deposit transaction
    const { data: transaction, error: transactionError } = await client
      .from("transactions")
      .insert({
        user_id: userId,
        // challenge_id is null for deposits not linked to a specific challenge
        type: "deposit",
        amount: amount,
        status: "completed", // Assuming simulated payment is successful
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) throw transactionError;

    // Update user's balance
    const { error: balanceError } = await client
      .from("profiles")
      .update({
        balance: client.rpc('increment', { x: amount }),
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (balanceError) throw balanceError;

    revalidatePath("/wallet"); // Revalidate wallet page cache

    return { success: true, data: transaction };

  } catch (error: any) {
    console.error("Error adding funds to wallet:", error);
    return { success: false, error: error.message };
  }
}

// Admin function to get all transactions
export async function getAllTransactions() {
  try {
    const client = await getSupabaseServerActionClient();
    
    // Note: Ensure the user making this call has admin privileges
    // This simple example assumes server actions bypass RLS or are called by an admin service role

    const { data, error } = await client
      .from("transactions")
      .select(`
        *,
        user:profiles(id, username, full_name, email),
        challenge:challenges(id, title)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };

  } catch (error: any) {
    console.error("Error fetching all transactions:", error);
    // Return an empty array on error for consistency
    return { success: false, error: error.message, data: [] };
  }
}

export async function getGlobalLeaderboard() {
  try {
    const client = await getSupabaseServerActionClient()
    
    // Get all users with their profiles and achievements
    const { data: users, error: usersError } = await client
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        total_earnings,
        challenges_won,
        challenges_created,
        created_at
      `)
      .order('total_earnings', { ascending: false })
      .limit(100)

    if (usersError) throw usersError

    // Get all approved submissions to calculate scores
    const { data: submissions, error: submissionsError } = await client
      .from('submissions')
      .select(`
        user_id,
        score,
        status
      `)
      .eq('status', 'approved')

    if (submissionsError) throw submissionsError

    // Calculate total score for each user
    const userScores = new Map()
    submissions.forEach(sub => {
      const currentScore = userScores.get(sub.user_id) || 0
      userScores.set(sub.user_id, currentScore + (sub.score || 0))
    })

    // Combine user data with scores and format leaderboard entries
    const leaderboardData = users.map((user, index) => ({
      id: user.id,
      user_id: user.id,
      name: user.full_name || 'Anonymous User',
      username: user.username || 'anonymous',
      avatar_url: user.avatar_url,
      score: userScores.get(user.id) || 0,
      rank: index + 1,
      achievements: user.challenges_won || 0,
      challenges_completed: user.challenges_created || 0
    }))

    return leaderboardData
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}
