/**
 * Razorpay — Cancel Subscription
 * Cancels at period end so user keeps access until renewal date.
 */
import { NextRequest, NextResponse } from "next/server";
import { wpGetMe } from "@/lib/wordpress";

const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WP_API_SECRET  = process.env.WP_API_SECRET        ?? "";
const WP_URL         = (process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const token = req.cookies.get("pixza_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let user: Awaited<ReturnType<typeof wpGetMe>>;
  try { user = await wpGetMe(token); }
  catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }

  const { subscription_id } = await req.json().catch(() => ({}));

  // Cancel in Razorpay (cancel_at_cycle_end = 1 means cancel at period end)
  if (subscription_id && RZP_KEY_ID && RZP_KEY_SECRET) {
    const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");
    await fetch(`https://api.razorpay.com/v1/subscriptions/${subscription_id}/cancel`, {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }),
    }).catch(() => {});
  }

  // Update WP user meta
  if (WP_URL && WP_API_SECRET) {
    await fetch(`${WP_URL}/?rest_route=${encodeURIComponent(`/pixza/v1/admin/users/${user.id}`)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WP-Secret": WP_API_SECRET },
      body: JSON.stringify({ subscription_status: "cancelled" }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, message: "Subscription cancelled. Access continues until period end." });
}
