import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { customer_email?: string; metadata?: { userId?: string } };
      const userId = session.metadata?.userId;
      if (userId) {
        await db.user.update({ where: { id: userId }, data: { plan: "PRO" } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as { metadata?: { userId?: string } };
      const userId = sub.metadata?.userId;
      if (userId) {
        await db.user.update({ where: { id: userId }, data: { plan: "FREE" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
