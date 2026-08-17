import { connectToDatabase } from "@/lib/db/mongoose";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import User from "@/models/User";
import type { AuthInput } from "@/lib/validation/auth";

export async function registerUser(input: AuthInput) {
    await connectToDatabase();

    const existingUser = await User.findOne({
        email: input.email
    });

    if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
        name: input.name,
        email: input.email,
        passwordHash,
    })

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
}


export async function authenticateUser(
    email: string,
    password: string
) {

    await connectToDatabase();

    const user = await User.findOne({
        email,
    }).select("+passwordHash");

    if (!user) {
        return null
    }

    const passwordValid = await verifyPassword(
        password,
        user.passwordHash,
    )

    if (!passwordValid) {
        return null
    }

    return ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
    })

}

