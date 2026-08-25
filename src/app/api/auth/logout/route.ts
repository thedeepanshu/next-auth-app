import { NextResponse } from "next/server";

import { deleteCurrentSession } from "@/services/session.service";

export async function POST() {
    try {

        await deleteCurrentSession();

        const response = NextResponse.json(
            {
                success: true,
                message: "Logged out successfully"
            }
        );

        response.cookies.set({
            name: "session",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        })

        return response;

    } catch(error) {
         console.error("Logout error:", error);

         return NextResponse.json(
            {
                success: true,
                message: "Something Went Wrong"
            },
            {
                status: 500
            }
         )
    }
}