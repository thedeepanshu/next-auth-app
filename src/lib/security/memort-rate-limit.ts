import type {
  RateLimitResult,
  RateLimiter,
} from "./rate-limit";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();

    const existing = this.store.get(identifier);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + this.windowMs;

      this.store.set(identifier, {
        count: 1,
        resetAt,
      });

      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetAt: new Date(resetAt),
      };
    }

    if (existing.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(existing.resetAt),
      };
    }

    existing.count += 1;

    return {
      success: true,
      remaining: this.maxRequests - existing.count,
      resetAt: new Date(existing.resetAt),
    };
  }
}