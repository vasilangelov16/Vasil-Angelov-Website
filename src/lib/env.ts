import { z } from "zod";

const pinSchema = z.string().regex(/^\d{4,12}$/, "must be 4-12 digits");
const httpUrlSchema = z.string().url().refine((v) => /^https?:\/\//.test(v), "must start with http:// or https://");
const wsUrlSchema = z.string().url().refine((v) => /^wss?:\/\//.test(v), "must start with ws:// or wss://");

function normalizeOptionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const rawSingerPin = normalizeOptionalEnv(import.meta.env.VITE_SINGER_PIN as string | undefined);
const rawMemberPin = normalizeOptionalEnv(import.meta.env.VITE_MEMBER_PIN as string | undefined);
const rawApiUrl = normalizeOptionalEnv(import.meta.env.VITE_API_URL as string | undefined);
const rawWsUrl = normalizeOptionalEnv(import.meta.env.VITE_WS_URL as string | undefined);

const issues: string[] = [];

const parsedSingerPin = rawSingerPin ? pinSchema.safeParse(rawSingerPin) : null;
const parsedMemberPin = rawMemberPin ? pinSchema.safeParse(rawMemberPin) : null;
const parsedApiUrl = rawApiUrl ? httpUrlSchema.safeParse(rawApiUrl) : null;
const parsedWsUrl = rawWsUrl ? wsUrlSchema.safeParse(rawWsUrl) : null;

if (parsedSingerPin && !parsedSingerPin.success) {
  issues.push(`VITE_SINGER_PIN ${parsedSingerPin.error.issues[0]?.message ?? "is invalid"}`);
}
if (parsedMemberPin && !parsedMemberPin.success) {
  issues.push(`VITE_MEMBER_PIN ${parsedMemberPin.error.issues[0]?.message ?? "is invalid"}`);
}
if (parsedApiUrl && !parsedApiUrl.success) {
  issues.push(`VITE_API_URL ${parsedApiUrl.error.issues[0]?.message ?? "is invalid"}`);
}
if (parsedWsUrl && !parsedWsUrl.success) {
  issues.push(`VITE_WS_URL ${parsedWsUrl.error.issues[0]?.message ?? "is invalid"}`);
}

if (issues.length > 0) {
  throw new Error(`Invalid app environment configuration:\n- ${issues.join("\n- ")}`);
}

export const ENV = {
  singerPin: parsedSingerPin?.success ? parsedSingerPin.data : "1234",
  memberPin: parsedMemberPin?.success ? parsedMemberPin.data : "5678",
  apiUrl: parsedApiUrl?.success ? parsedApiUrl.data : undefined,
  wsUrl: parsedWsUrl?.success ? parsedWsUrl.data : undefined,
} as const;

