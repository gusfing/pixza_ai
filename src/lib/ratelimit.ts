import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only instantiate if env vars are present (skip in dev without Redis)
function createRatelimiter(requests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: true,
  });
}

// Free plan: 20 generations / hour
export const freeLimiter = createRatelimiter(20, "1 h");

// Pro plan: 200 generations / hour
export const proLimiter = createRatelimiter(200, "1 h");

// Auth endpoints: 10 attempts / 15 min
export const authLimiter = createRatelimiter(10, "15 m");

export async function checkRateLimit(
  limiter: ReturnType<typeof createRatelimiter>,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) return { success: true, remaining: 999, reset: 0 };

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function getRateLimitRemaining(
  limiter: ReturnType<typeof createRatelimiter>,
  identifier: string
): Promise<{ limit: number; remaining: number; reset: number }> {
  if (!limiter) return { limit: 999, remaining: 999, reset: 0 };
  
  // @ts-ignore - Some older versions of Upstash limit types have 'getRemaining' but it might be poorly typed
  try {
    const result = await limiter.getRemaining(identifier);
    return {
      limit: result.limit || 999,
      remaining: result.remaining || 999,
      reset: result.reset || 0,
    };
  } catch (e) {
    // Fallback if getRemaining isn't available
    return { limit: 999, remaining: 999, reset: 0 };
  }
}

