import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

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

// In-memory fallback counters (dev only — resets on restart)
const memoryCounters = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryCounters.get(identifier);
  if (!entry || now > entry.resetAt) {
    memoryCounters.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function checkRateLimit(
  limiter: ReturnType<typeof createRatelimiter>,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) {
    // In production without Redis: apply a conservative in-memory limit
    if (IS_PRODUCTION) {
      const ok = memoryRateLimit(identifier, 10, 60 * 60 * 1000); // 10/hr fallback
      return { success: ok, remaining: ok ? 9 : 0, reset: 0 };
    }
    // In dev: allow all
    return { success: true, remaining: 999, reset: 0 };
  }

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
  if (!limiter) return { limit: IS_PRODUCTION ? 10 : 999, remaining: IS_PRODUCTION ? 10 : 999, reset: 0 };

  try {
    // @ts-ignore
    const result = await limiter.getRemaining(identifier);
    return {
      limit: result.limit || 999,
      remaining: result.remaining || 999,
      reset: result.reset || 0,
    };
  } catch {
    return { limit: 999, remaining: 999, reset: 0 };
  }
}

