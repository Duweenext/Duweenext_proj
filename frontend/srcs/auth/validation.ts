// validation.ts
import { z } from "zod";
import { getPasswordStrength } from "../utlis/passwordStrength";

export const signUpSchema = z.object({
  username: z.string().min(3, "Too short"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password too short")
    .refine((val) => getPasswordStrength(val) !== "Weak", {
      message: "Password is too weak",
    }),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Too short")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[a-zA-Z0-9_]+$/.test(val),
      {
        message: "Invalid email or username",
      }
    ),
  password: z.string().min(8, "Too Weak"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
