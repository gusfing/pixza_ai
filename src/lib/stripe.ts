import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    generationsPerHour: 20,
    priceId: null,
  },
  PRO: {
    name: "Pro",
    price: 9,
    generationsPerHour: 200,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const;
