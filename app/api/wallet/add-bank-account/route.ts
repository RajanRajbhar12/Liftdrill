import { NextResponse } from "next/server";

// TODO: Implement addBankAccount logic or restore '@/lib/payments'

export async function POST(request: Request) {
  return NextResponse.json(
    { success: false, error: "addBankAccount API not implemented." },
    { status: 501 }
  );
} 