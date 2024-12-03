"use client";

import { Button } from "@/components/ui/Button";
import { GUILD_AUTH_COOKIE_NAME } from "@/config/constants";
import { env } from "@/lib/env";
import { getCookieClientSide } from "@/lib/getCookieClientSide";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { joinGuild, leaveGuild } from "../actions";
import { guildOptions, userOptions } from "../options";

export const JoinButton = () => {
  const { guildUrlName } = useParams<{ guildUrlName: string }>();
  const user = useQuery(userOptions());
  const guild = useQuery(guildOptions({ idLike: guildUrlName }));
  const queryClient = useQueryClient();

  if (!guild.data) {
    throw new Error("Failed to fetch guild");
  }

  const isJoined = !!user.data?.guilds?.some(
    ({ guildId }) => guildId === guild.data.id,
  );

  const joinMutation = useMutation({
    mutationFn: async () => {
      const token = getCookieClientSide(GUILD_AUTH_COOKIE_NAME)!;
      const url = new URL(
        `api/guild/${guild.data.id}/join`,
        env.NEXT_PUBLIC_API,
      );
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "text/event-stream",
        },
      });

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();

      if (reader) {
        while (true) {
          const res = await reader.read();
          if (res.done) break;
          console.log(res.value);
          //toast(res.value?.status, { description: res.value?.message });
        }
      }

      joinGuild({ guildId: guild.data.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGuild({ guildId: guild.data.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return isJoined ? (
    <Button
      colorScheme="destructive"
      className="rounded-2xl"
      onClick={() => {
        leaveMutation.mutate();
      }}
      isLoading={leaveMutation.isPending}
      loadingText="Leaving Guild"
    >
      Leave Guild
    </Button>
  ) : (
    <Button
      colorScheme="success"
      className="rounded-2xl"
      onClick={() => {
        joinMutation.mutate();
      }}
      isLoading={joinMutation.isPending}
      loadingText="Joining Guild"
    >
      Join Guild
    </Button>
  );
};
