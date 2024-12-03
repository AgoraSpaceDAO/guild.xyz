import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PINATA_ADMIN_JWT: z.string(),
    LOGGING: z.coerce.number().nonnegative().int().max(1),
  },
  client: {
    NEXT_PUBLIC_API: z.string().url(),
    NEXT_PUBLIC_PINATA_GATEWAY_URL: z.string().url(),
    NEXT_PUBLIC_LOGGING: z.coerce.number().nonnegative().int().max(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API_V3,
    PINATA_ADMIN_JWT: process.env.PINATA_ADMIN_JWT,
    NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL,
    NEXT_PUBLIC_LOGGING: process.env.LOGGING,
    LOGGING: process.env.LOGGING,
  },
});
