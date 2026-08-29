import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  SIMULATION_DATA_SIZE: z.coerce.number().default(1200),
  ENABLE_IN_MEMORY_FALLBACK: z.preprocess(
    (val) => val === undefined || val === "true" || val === true,
    z.boolean()
  ).default(true),
});

export const env = envSchema.parse(process.env);
