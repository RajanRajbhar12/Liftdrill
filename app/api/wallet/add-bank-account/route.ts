import { NextResponse } from "next/server";
import { addBankAccount } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await addBankAccount(formData);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error adding bank account via API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 