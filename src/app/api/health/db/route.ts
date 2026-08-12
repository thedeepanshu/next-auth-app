import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({
            success: true,
            message: "MongoDB Connected Successfully",
        });
    } catch(error) {
       console.log("MongoDB Connection Error: ", error);
       return NextResponse.json(
            {
                success: false,
                message: "MongoDB Connection failed",
            },
            { status: 500 }
        );
    }
}
