import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/validation/login";
import { authenticateUser } from "@/services/auth.service";
import { createSession } from "@/services/session.service";

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
            name: "Session",
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