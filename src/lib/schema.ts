// Zod schemas for input validation in forms and API routes.
import { z } from "zod";

export const passphraseSchema = z
  .string()
  .min(8, "Passphrase must be at least 8 characters")
  .regex(/[A-Z]/, "Passphrase must include an uppercase letter")
  .regex(/[a-z]/, "Passphrase must include a lowercase letter")
  .regex(/[0-9]/, "Passphrase must include a number")
  .regex(
    /[!@#$%^&*]/,
    "Passphrase must include a special character (!@#$%^&*)"
  );

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be 100 characters or less"),
});

export const clientApiSchema = z.object({
  encrypted_data: z.object({}).passthrough(),
});

export const clientUpdateSchema = z.object({
  id: z.string().uuid(),
  encrypted_data: z.object({}).passthrough(),
});

export const clientDeleteSchema = z.object({
  id: z.string().uuid(),
});
