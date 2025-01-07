import type { GuildReward } from "@/lib/schemas/guildReward";
import { useMemo } from "react";
import { usePageMonoviewSuspense } from "./usePageMonoview";

export const useSuspenseRewards = () => {
  const { data: page, ...rest } = usePageMonoviewSuspense();
  const data = useMemo(() => {
    // @ts-ignore
    const rewardsDuplicated = page.roles
      .flatMap((role) => role.rewards)
      .filter(Boolean) as GuildReward[];
    const rewards: Record<string, GuildReward> = {};
    for (const reward of rewardsDuplicated) {
      rewards[reward.id] = reward;
    }
    return Object.values(rewards);
  }, [page]);

  return {
    ...rest,
    data,
  };
};
