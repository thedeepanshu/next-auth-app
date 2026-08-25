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
    return null;
  }

  if (
    user.lockedUntil &&
    user.lockedUntil.getTime() > Date.now()
  ) {
    return null;
  }

  const passwordValid = await verifyPassword(
    password,
    user.passwordHash,
  );

  if (!passwordValid) {
    const failedAttempts = user.failedLoginAttempts + 1;

    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MS = 15 * 60 * 1000;

    if (failedAttempts >= MAX_ATTEMPTS) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = new Date(
        Date.now() + LOCK_DURATION_MS
      );
    } else {
      user.failedLoginAttempts = failedAttempts;
    }

    await user.save();

    return null;
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;

  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

