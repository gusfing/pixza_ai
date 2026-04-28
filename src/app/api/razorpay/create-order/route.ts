/**
 * Razorpay — Create Order
 * Called before showing the Razorpay checkout modal.
 * Returns an order_id that the frontend passes to Razorpay.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { wpGetMe } from "@/lib/wordpress";

const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

// Plan prices in paise (INR × 100)
const PLAN_PRICES: Record<string, number> = {
  pro:    1999 * 100,   // ₹1,999/month
  agency: 6999 * 100,   // ₹6,999/month
};

const PLAN_NAMES: Record<string, string> = {
  pro:    "Pixza Pro",
  agency: "Pixza Agency",
};

export async function POST(req: NextRequest) {
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
      { status: 500 }
    );
  }

  // Auth — require WP token
  const token = req.cookies.get("pixza_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let user: Awaited<ReturnType<typeof wpGetMe>>;
  try {
    user = await wpGetMe(token);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { plan } = await req.json().catch(() => ({}));
  if (!plan || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan. Must be 'pro' or 'agency'." }, { status: 400 });
  }

  // Create Razorpay order via their REST API
  const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");
  const receiptId = `pixza_${user.id}_${plan}_${Date.now()}`;

  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount:   PLAN_PRICES[plan],
      currency: "INR",
      receipt:  receiptId,
      notes: {
        user_id:    String(user.id),
        user_email: user.email,
        plan,
      },
    }),
  });

  if (!rzpRes.ok) {
    const err = await rzpRes.json().catch(() => ({})) as any;
    return NextResponse.json(
      { error: err?.error?.description || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }

  const order = await rzpRes.json() as any;

  return NextResponse.json({
    order_id:   order.id,
    amount:     order.amount,
    currency:   order.currency,
    key_id:     RZP_KEY_ID,
    plan,
    plan_name:  PLAN_NAMES[plan],
    user_name:  user.name || user.username,
    user_email: user.email,
  });
}
