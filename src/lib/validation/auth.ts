import { z } from "zod";

export const authSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(100, "Name must be less than 100 characters"),
        email: z
            .string()
            .trim()
            .lowercase()
            .pipe(z.email()),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(125, "Password must be less than 125 characters")
            .regex(/[A-Z]/, "Password must contain an uppercase letter")
            .regex(/[a-z]/, "Password must contain a lowercase letter")
            .regex(/[0-9]/, "Password must contain a number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ['confirmPassword'],
    });

export type AuthInput = z.infer<typeof authSchema>;