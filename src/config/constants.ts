import type { IdentityType } from "@/lib/schemas/user";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { DiscordLogo } from "@phosphor-icons/react/dist/ssr";

export const IDENTITY_STYLES = {
  DISCORD: {
    mainColorClassName: "bg-indigo-500",
    buttonColorsClassName:
      "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 dark:hover:bg-indigo-400 dark:active:bg-indigo-300",
    icon: DiscordLogo,
  },
} satisfies Record<
  IdentityType,
  {
    mainColorClassName: string;
    buttonColorsClassName: string;
    icon: Icon;
  }
>;
