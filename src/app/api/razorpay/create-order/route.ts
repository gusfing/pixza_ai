/**
 * Razorpay — Create Order (one-time) OR Subscription
 * Supports both one-time payments and recurring subscriptions.
 */
import { NextRequest, NextResponse } from "next/server";
import { wpGetMe } from "@/lib/wordpress";

const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

// Plan prices in paise (INR × 100)
const PLAN_PRICES: Record<string, number> = {
  pro:    999 * 100,    // ₹999/month
  agency: 2999 * 100,  // ₹2,999/month
};

// Razorpay Plan IDs for subscriptions (create these in Razorpay dashboard)
// If not set, falls back to one-time order
const PLAN_IDS: Record<string, string> = {
  pro:    process.env.RAZORPAY_PLAN_ID_PRO    ?? "",
  agency: process.env.RAZORPAY_PLAN_ID_AGENCY ?? "",
};

const PLAN_NAMES: Record<string, string> = {
  pro:    "Pixza Pro",
  agency: "Pixza Agency",
};

const rzpAuth = () => Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");

export async function POST(req: NextRequest) {
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay credentials not configured." }, { status: 500 });
  }

  const token = req.cookies.get("pixza_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let user: Awaited<ReturnType<typeof wpGetMe>>;
  try { user = await wpGetMe(token); }
  catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }

  const { plan } = await req.json().catch(() => ({}));
  if (!plan || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  // Try subscription first (recurring), fall back to one-time order
  const planId = PLAN_IDS[plan];

  if (planId) {
    // Create Razorpay Subscription
    const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { "Authorization": `Basic ${rzpAuth()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id:        planId,
        total_count:    12, // 12 months
        quantity:       1,
        customer_notify: 1,
        notes: { user_id: String(user.id), user_email: user.email, plan },
      }),
    });

    if (subRes.ok) {
      const sub = await subRes.json() as any;
      return NextResponse.json({
        type:         "subscription",
        subscription_id: sub.id,
        key_id:       RZP_KEY_ID,
        plan,
        plan_name:    PLAN_NAMES[plan],
        user_name:    user.name || user.username,
        user_email:   user.email,
      });
    }
  }

  // Fallback: one-time order
  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Authorization": `Basic ${rzpAuth()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount:   PLAN_PRICES[plan],
      currency: "INR",
      receipt:  `pixza_${user.id}_${plan}_${Date.now()}`,
      notes:    { user_id: String(user.id), user_email: user.email, plan },
    }),
  });

  if (!rzpRes.ok) {
    const err = await rzpRes.json().catch(() => ({})) as any;
    return NextResponse.json({ error: err?.error?.description || "Failed to create order" }, { status: 500 });
  }

  const order = await rzpRes.json() as any;
  return NextResponse.json({
    type:       "order",
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
