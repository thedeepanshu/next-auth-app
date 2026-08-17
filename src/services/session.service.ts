import { connectToDatabase } from "@/lib/db/mongoose";
import { generateSessionToken, hashSessionToken } from "@/lib/security/session";
import Session from "@/models/Session";

const  SESSION_DURATION_DAYS = 7;

export async function createSession(userId: string) {
    await connectToDatabase();

    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);

    const expiresAt = new Date();
    expiresAt.setDate(
        expiresAt.getDate() + SESSION_DURATION_DAYS
    );

    await Session.create({
        userId,
        sessionTokenHash,
        expiresAt,
        lastUsedAt: new Date(),
    });

    return {
        sessionToken,
        expiresAt
    }

}
