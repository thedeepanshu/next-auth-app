import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/db/mongoose";
import { generateSessionToken, hashSessionToken } from "@/lib/security/session";
import Session from "@/models/Session";
import User from "@/models/User";

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

export async function getCurrentUser() {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
        return null;
    }

    const sessionTokenHash = hashSessionToken(sessionToken);

    connectToDatabase();

    const session = await Session.findOne({
        sessionTokenHash,
        expiresAt: { $gt: new Date() },
    });

    if (!session) {
        return null;
    }

    const user = await User.findById(session.userId).select(
        "_id name email role emailVerified createdAt"
    );

    if (!user) {
        return null;
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    }
}

export async function deleteCurrentSession() {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
        return null
    }

    const sessionTokenHash = hashSessionToken(sessionToken);

    await connectToDatabase();

    await Session.deleteOne({
        sessionTokenHash,
    })
}