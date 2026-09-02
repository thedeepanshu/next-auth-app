import { MemoryRateLimiter } from "./memort-rate-limit";

export const loginRateLimiter = new MemoryRateLimiter(
    10,
    60 * 1000
);