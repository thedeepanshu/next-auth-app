import { NextResponse } from "next/server";
import { z } from "zod";

import { authSchema } from "@/lib/validation/auth";
import { registerUser } from "@/services/auth.service";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = authSchema.safeParse(body);

        if (!result.success) {
            const errors = z.treeifyError(result.error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Input",
                    error: errors.properties,
                },
                { 
                    status: 400 
                }
            )
        }

        const user = await registerUser(result.data);

        return NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                user,
            },
            {
                status: 200
            }
        );

    } catch(error) {
        if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to create account",
                },
                {
                    status: 400
                }
            );
        }

        console.error("Registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500
            }
        );
    }
}