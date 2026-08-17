import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/lib/security/password";

export async function POST() {
    try {
        await connectToDatabase();
        const passwordHash =  await hashPassword("ABCD@321");

        const user = await User.create({
            name: "Deep",
            email: "deep211@gmail.com",
            passwordHash,
        })

        return NextResponse.json({
            success: true,
            userId: user._id,
            message: "Successfully created user",
        });
    } catch(error) {
         console.error("User creation failed:", error);

         return NextResponse.json(
            {
                success: false,
                message: "Failed to create user"
            },
            {
                status: 500
            }
        );
    }
}