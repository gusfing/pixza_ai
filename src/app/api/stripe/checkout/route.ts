import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Stripe integration deprecated — payments handled via WooCommerce/WordPress
export async function POST() {
  return NextResponse.json({ error: "Not available. Use the WordPress checkout flow." }, { status: 404 });
}
