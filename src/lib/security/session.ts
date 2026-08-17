import { createHash, randomBytes } from "crypto";

export function generateSessionToken(): string {
    const token = randomBytes(32).toString("hex");
    return token;
}

export function hashSessionToken(token: string): string {
    const hash = createHash("sha256")
                    .update(token)
                    .digest("hex");
    return hash;
}