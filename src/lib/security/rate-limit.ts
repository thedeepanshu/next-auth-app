export interface RateLimitResult{
    success: boolean;
    remaining: number;
    resetAt: Date;
}

export interface RateLimiter{
    limit(identifier: string): Promise<RateLimitResult>;
}