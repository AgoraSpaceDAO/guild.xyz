"use client";

import { RequirementDisplayComponent } from "@/components/requirements/RequirementDisplayComponent";
import { rewardCards } from "@/components/rewards/rewardCards";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cssUtils";
import { fetchGuildApiData } from "@/lib/fetchGuildApi";
import { roleBatchOptions, userOptions } from "@/lib/options";
import type { GuildReward, GuildRewardType } from "@/lib/schemas/guildReward";
import type { Role } from "@/lib/schemas/role";
import { Check, ImageSquare, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useGuild } from "../hooks/useGuild";

const GuildPage = () => {
  const { pageUrlName, guildUrlName } = useParams<{
    pageUrlName: string;
    guildUrlName: string;
  }>();
  const { data: roles } = useSuspenseQuery(
    roleBatchOptions({
      guildIdLike: guildUrlName,
      pageIdLike: pageUrlName,
    }),
  );

  return (
    <div className="my-4 space-y-4">
      {roles.map((role) => (
        <Suspense
          fallback={<Skeleton className="h-40 w-full rounded-xl" />}
          key={role.id}
        >
          <RoleCard role={role} />
        </Suspense>
      ))}
    </div>
  );
};

const RoleCard = ({ role }: { role: Role }) => (
  <Card className="flex flex-col md:flex-row" key={role.id}>
    <div className="@container flex flex-col border-r p-5 md:w-1/2">
      <div className="mb-2 flex items-center gap-3">
        {role.imageUrl ? (
          <img
            className="size-14 rounded-full border"
            src={role.imageUrl}
            alt="role avatar"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-image">
            <ImageSquare weight="duotone" className="size-6" />
          </div>
        )}
        <h3 className="font-extrabold text-xl">{role.name}</h3>
      </div>
      <p className="mb-4 text-foreground-dimmed leading-relaxed">
        {role.description}
      </p>

      <Suspense fallback={<p>Loading rewards...</p>}>
        <RoleRewards roleId={role.id} roleRewards={role.rewards} />
      </Suspense>
    </div>

    <div className="bg-card-secondary md:w-1/2">
      <div className="flex items-center justify-between p-5">
        <span className="font-bold text-foreground-secondary text-xs">
          REQUIREMENTS
        </span>

        <AccessIndicator roleId={role.id} className="hidden sm:flex" />
      </div>

      {/* TODO group rules by access groups */}
      <div className="grid px-5 pb-5">
        {role.accessGroups[0].rules?.map((rule) => (
          <RequirementDisplayComponent
            key={rule.accessRuleId}
            requirement={rule}
          />
        ))}
      </div>

      <AccessIndicator roleId={role.id} className="sm:hidden" />
    </div>
  </Card>
);

const RoleRewards = ({
  roleId,
  roleRewards,
}: { roleId: string; roleRewards: Role["rewards"] }) => {
  const { data: guild } = useGuild();
  const { data: rewards } = useSuspenseQuery<GuildReward[]>({
    queryKey: ["reward", "search", guild.id],
    queryFn: () =>
      fetchGuildApiData<{ items: GuildReward[] }>(
        `reward/search?customQuery=@guildId:{${guild.id}}`,
      ).then((data) => data.items), // TODO: we shouldn't do this, we should just get back an array on this endpoint in my opinion
  });

  return roleRewards?.length > 0 && rewards?.length > 0 ? (
    <div className="mt-auto grid @[26rem]:grid-cols-2 gap-2">
      {roleRewards.map((roleReward) => {
        const guildReward = rewards.find((gr) => gr.id === roleReward.rewardId);
        if (!guildReward) return null;

        const hasRewardCard = (
          rewardType: GuildRewardType,
        ): rewardType is keyof typeof rewardCards => rewardType in rewardCards;

        const RewardCard = hasRewardCard(guildReward.type)
          ? rewardCards[guildReward.type]
          : null;

        if (!RewardCard) return null;

        return (
          <RewardCard
            key={roleReward.rewardId}
            roleId={roleId}
            reward={{
              guildReward,
              roleReward,
            }}
          />
        );
      })}
    </div>
  ) : null;
};

// TODO: handle state during join & error/no access states too
const ACCESS_INDICATOR_CLASS =
  "rounded-b-2xl rounded-t-none min-w-full justify-between sm:rounded-b-xl sm:rounded-t-xl sm:min-w-max";
const AccessIndicator = ({
  roleId,
  className,
}: { roleId: Role["id"]; className?: string }) => {
  const { data: guild } = useGuild();

  const { data: user } = useQuery(userOptions());
  const isGuildMember = user?.guilds?.find((g) => g.guildId === guild.id);
  const isRoleMember = !!user?.guilds
    ?.flatMap((g) => g.roles)
    ?.find((r) => r?.roleId === roleId);

  if (!isGuildMember)
    return (
      <Button
        size="sm"
        leftIcon={<LockSimple weight="bold" />}
        className={cn(ACCESS_INDICATOR_CLASS, className)}
      >
        Join guild to collect rewards
      </Button>
    );

  if (!isRoleMember)
    return (
      <Button
        size="sm"
        leftIcon={<LockSimple weight="bold" />}
        className={cn(ACCESS_INDICATOR_CLASS, className)}
      >
        Check access to collect rewards
      </Button>
    );

  return (
    <Badge
      className={buttonVariants({
        size: "sm",
        colorScheme: "success",
        variant: "subtle",
        className: [ACCESS_INDICATOR_CLASS, className, "pointer-events-none"],
      })}
    >
      <Check weight="bold" />
      <span>You have access</span>
    </Badge>
  );
};

export default GuildPage;
