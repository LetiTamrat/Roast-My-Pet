import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

export type LimiterKind = "upload" | "roast" | "reaction" | "share" | "flag";

const cache = new Map<LimiterKind, Ratelimit>();

function build(kind: LimiterKind): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  switch (kind) {
    case "upload":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "rl:upload",
      });
    case "roast":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "rl:roast",
      });
    case "reaction":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "rl:react",
      });
    case "share":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "rl:share",
      });
    case "flag":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
        prefix: "rl:flag",
      });
  }
}

export function getLimiter(kind: LimiterKind): Ratelimit | null {
  if (process.env.ENABLE_RATE_LIMIT === "false") return null;
  if (cache.has(kind)) return cache.get(kind)!;
  const lim = build(kind);
  if (lim) cache.set(kind, lim);
  return lim;
}

export interface LimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}

export async function limit(kind: LimiterKind, identifier: string): Promise<LimitResult> {
  const lim = getLimiter(kind);
  if (!lim) {
    return { ok: true, limit: 0, remaining: 0, reset: 0, retryAfter: 0 };
  }
  const res = await lim.limit(identifier);
  const retryAfter = Math.max(0, Math.ceil((res.reset - Date.now()) / 1000));
  return {
    ok: res.success,
    limit: res.limit,
    remaining: res.remaining,
    reset: res.reset,
    retryAfter,
  };
}
