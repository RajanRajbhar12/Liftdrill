import { NextResponse } from "next/server";

// TODO: Implement addBankAccount logic or restore '@/lib/payments'

export async function POST(request: Request) {
  return NextResponse.json(
    { success: false, error: "Adding a bank account is not available yet. Please contact support or try again later." },
    { status: 501 }
  );
} 