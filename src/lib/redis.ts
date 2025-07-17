import { Redis } from "@upstash/redis";
import { env } from "~/env";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache keys
export const CACHE_KEYS = {
  SHEETS_METADATA: "sheets:metadata",
  SHEET_DATA: (sheetTitle: string) => `sheet:data:${sheetTitle}`,
} as const;

// Cache TTL (time to live) in seconds
export const CACHE_TTL = {
  SHEETS_METADATA: 86400, // 24 hours (86400 seconds)
  SHEET_DATA: 86400, // 24 hours (86400 seconds)
} as const;
