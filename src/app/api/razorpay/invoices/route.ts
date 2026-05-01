/**
 * Razorpay — List Payments (Invoice History)
 * Returns past payments for the authenticated user.
 */
import { NextRequest, NextResponse } from "next/server";
import { wpGetMe } from "@/lib/wordpress";

const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("pixza_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let user: Awaited<ReturnType<typeof wpGetMe>>;
  try { user = await wpGetMe(token); }
  catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }

  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return NextResponse.json({ payments: [] });
  }

  const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");

  // Fetch payments with notes matching this user
  const res = await fetch(
    `https://api.razorpay.com/v1/payments?count=20`,
    { headers: { "Authorization": `Basic ${auth}` } }
  ).catch(() => null);

  if (!res?.ok) return NextResponse.json({ payments: [] });

  const data = await res.json() as any;
  const userEmail = user.email;

  // Filter to this user's payments
  const payments = (data.items ?? [])
    .filter((p: any) => p.email === userEmail || p.notes?.user_id === String(user.id))
    .map((p: any) => ({
      id:          p.id,
      amount:      p.amount / 100,
      currency:    p.currency,
      status:      p.status,
      method:      p.method,
      description: p.description,
      created_at:  new Date(p.created_at * 1000).toISOString(),
      receipt:     p.order_id,
    }));

  return NextResponse.json({ payments });
}
