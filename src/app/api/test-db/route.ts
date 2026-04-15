import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("Testing DB connection...");
    // Try a simple query
    const userCount = await db.user.count();
    return NextResponse.json({ success: true, userCount });
  } catch (error) {
    console.error("DB Connection test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown DB error",
      details: JSON.stringify(error)
    }, { status: 500 });
  }
}
