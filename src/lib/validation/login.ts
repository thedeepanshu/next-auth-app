import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .lowercase()
        .pipe(z.email("Please enter a valid email address")),
    password: z
        .string()
        .min(1, "Password is required")
        .max(125, "Invalid credentials"),
});

export type LoginInput = z.infer<typeof loginSchema>;