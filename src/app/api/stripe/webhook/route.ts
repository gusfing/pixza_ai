import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Stripe webhook deprecated — subscription events handled via WooCommerce
export async function POST() {
  return NextResponse.json({ received: true });
}
