import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/validation/login";
import { authenticateUser } from "@/services/auth.service";
import { createSession } from "@/services/session.service";
import { loginRateLimiter } from "@/lib/security/login-rate-limit";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                success: false,
                message: "Invalid input",
                },
                { status: 400 }
            );
        }

        const identifier = result.data.email;
        const rateLimit = await loginRateLimiter.limit(identifier);

        if (!rateLimit.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Too many login attempts. Please try again later.",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil(
                            (rateLimit.resetAt.getTime() - Date.now()) / 1000
                        ).toString(),
                    },
                }
            )
        }

        const user = await authenticateUser(
            result.data.email,
            result.data.password
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password"
                },
                {
                    status: 401
                }
            );
        }

        const session = await createSession(user.id);

        const response = NextResponse.json(
            {
                success: true,
                message: "Login Successfully",
                user,
            });

        response.cookies.set({
            name: "session",
            value: session.sessionToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });

        return response;
        

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500
            }
        )
    }
}