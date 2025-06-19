import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get or create user's wallet
    let { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", currentUser.id)
      .single()

    if (walletError && walletError.code === "PGRST116") {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({
          user_id: currentUser.id,
          balance: 0
        })
        .select("balance")
        .single()

      if (createError) {
        throw createError
      }

      walletData = newWallet
    } else if (walletError) {
      throw walletError
    }

    // Get user's transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select(`
        id,
        amount,
        type,
        status,
        challenge_id,
        challenge:challenges(title),
        created_at
      `)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })

    if (transactionsError) {
      throw transactionsError
    }

    return NextResponse.json({
      success: true,
      data: {
        user: currentUser,
        balance: walletData?.balance || 0,
        transactions: transactions || []
      }
    })
  } catch (error: any) {
    console.error("Error in wallet data route:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 