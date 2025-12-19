import { fetchVendorTransactions } from "@/utils/fetchVendorTransactions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await fetchVendorTransactions();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
