import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { amount } = await request.json()
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", currentUser.id)
      .single()

    if (walletError) {
      throw walletError
    }

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // Start a transaction
    const { error: transactionError } = await supabase.rpc("increment_balance", {
      p_user_id: currentUser.id,
      p_amount: -amount // Use negative amount for withdrawal
    })

    if (transactionError) {
      throw transactionError
    }

    // Record the transaction
    const { error: recordError } = await supabase.from("transactions").insert({
      user_id: currentUser.id,
      amount,
      type: "withdraw",
      status: "completed"
    })

    if (recordError) {
      throw recordError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in withdraw route:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 