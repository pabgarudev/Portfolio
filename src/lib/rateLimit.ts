import { Redis } from "@upstash/redis";

/**
 * Per-IP fixed-window throttle for the contact endpoint.
 *
 * Fixed window rather than a sliding log: a caller can in theory get 2N
 * through across a window boundary, which for a contact form is irrelevant —
 * and it costs one round trip instead of a sorted-set read/trim/write.
 */
const LIMIT = 3;
const WINDOW_SECONDS = 10 * 60;

// Vercel's Upstash marketplace integration provisions KV_REST_API_*; a
// standalone Upstash database provisions UPSTASH_REDIS_REST_*. Accept either
// so the same code works however the store was attached.
const REST_URL =
  import.meta.env.UPSTASH_REDIS_REST_URL || import.meta.env.KV_REST_API_URL;
const REST_TOKEN =
  import.meta.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.KV_REST_API_TOKEN;

const redis =
  REST_URL && REST_TOKEN ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

/**
 * In-process fallback, used only when no Redis is configured (local dev, or a
 * preview deploy without the integration attached). Serverless instances are
 * ephemeral and there are many of them, so this stops a naive loop against one
 * warm instance and nothing more — it is deliberately not the production path.
 */
const memoryHits = new Map<string, { count: number; resetAt: number }>();

function checkInMemory(key: string, now: number): RateLimitResult {
  const entry = memoryHits.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    // Bound the map: without this, a spray of unique IPs grows it until the
    // instance is recycled.
    if (memoryHits.size > 10_000) {
      for (const [k, v] of memoryHits) if (v.resetAt <= now) memoryHits.delete(k);
    }
    return { allowed: true, retryAfter: 0 };
  }

  entry.count++;
  return entry.count > LIMIT
    ? { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
    : { allowed: true, retryAfter: 0 };
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets; 0 when allowed. */
  retryAfter: number;
}

/**
 * Resolves the caller's IP. `x-forwarded-for` is a client-settable header in
 * general, but on Vercel the platform overwrites it at the edge, so the first
 * entry is the real peer and cannot be spoofed by the client.
 */
export function clientIpFrom(request: Request, fallback?: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || fallback || "unknown";
}

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `contact:rl:${ip}`;

  if (!redis) return checkInMemory(key, now);

  try {
    const count = await redis.incr(key);
    // Only the first hit of a window sets the TTL, so the window is anchored
    // to the first request rather than sliding forward on every one (which
    // would let a steady trickle hold the key alive indefinitely).
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
      return { allowed: true, retryAfter: 0 };
    }

    if (count > LIMIT) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS };
    }

    return { allowed: true, retryAfter: 0 };
  } catch (err) {
    // Fail open. A throttle that 500s when its store is unreachable turns a
    // Redis outage into "nobody can contact me", which is worse than the spam
    // it prevents.
    console.error("Rate limit store unavailable, allowing request:", err);
    return { allowed: true, retryAfter: 0 };
  }
}
