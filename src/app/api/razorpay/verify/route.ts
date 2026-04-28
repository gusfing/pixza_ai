/**
 * Razorpay — Verify Payment
 * Called after the user completes payment in the Razorpay modal.
 * Verifies the HMAC signature, then upgrades the user's plan via WordPress.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { wpGetMe } from "@/lib/wordpress";

const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WP_API_SECRET  = process.env.WP_API_SECRET        ?? "";
const WP_URL         = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";

const PLAN_CREDITS: Record<string, number> = {
  pro:    2000,
  agency: 10000,
};

export async function POST(req: NextRequest) {
  if (!RZP_KEY_SECRET) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  // Auth
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

  const body = await req.json().catch(() => ({})) as any;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // ── Verify HMAC signature ─────────────────────────────────
  const expectedSig = crypto
    .createHmac("sha256", RZP_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  // ── Upgrade user in WordPress ─────────────────────────────
  const credits = PLAN_CREDITS[plan] ?? 2000;

  try {
    const upgradeRes = await fetch(`${WP_URL}/wp-json/pixza/v1/credits/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Secret": WP_API_SECRET,
      },
      body: JSON.stringify({
        user_id: user.id,
        amount:  credits,
        plan,
      }),
    });

    if (!upgradeRes.ok) {
      const err = await upgradeRes.json().catch(() => ({})) as any;
      console.error("[razorpay/verify] WP upgrade failed:", err);
      // Don't fail the response — payment succeeded, log for manual fix
    }

    // Also store payment reference in WP user meta
    await fetch(`${WP_URL}/wp-json/pixza/v1/admin/users/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Secret": WP_API_SECRET,
      },
      body: JSON.stringify({
        plan,
        razorpay_payment_id,
        razorpay_order_id,
        subscription_status: "active",
      }),
    }).catch(() => {});

  } catch (e) {
    console.error("[razorpay/verify] Error upgrading user:", e);
  }

  return NextResponse.json({
    success: true,
    plan,
    credits,
    payment_id: razorpay_payment_id,
  });
}
