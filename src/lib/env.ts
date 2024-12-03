import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PINATA_ADMIN_JWT: z.string(),
  },
  shared: {
    LOGGING: z.coerce.number().nonnegative().int().max(1).default(0),
  },
  client: {
    NEXT_PUBLIC_API: z.string().url(),
    NEXT_PUBLIC_PINATA_GATEWAY_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API_V3,
    PINATA_ADMIN_JWT: process.env.PINATA_ADMIN_JWT,
    NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL,
    LOGGING: process.env.LOGGING,
  },
});
