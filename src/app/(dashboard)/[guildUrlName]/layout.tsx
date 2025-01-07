import { GuildImage } from "@/components/GuildImage";
import { fetchGuildApiData } from "@/lib/fetchGuildApi";
import { getQueryClient } from "@/lib/getQueryClient";
import { guildOptions } from "@/lib/options";
import type { DynamicRoute } from "@/lib/types";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { type PropsWithChildren, Suspense } from "react";
import { ActionButton, ActionButtonSkeleton } from "./components/ActionButton";
import { GuildTabs, GuildTabsSkeleton } from "./components/GuildTabs";

const GuildLayout = async ({
  params,
  children,
}: PropsWithChildren<DynamicRoute<{ guildUrlName: string }>>) => {
  const { guildUrlName } = await params;
  const queryClient = getQueryClient();
  const guild = await queryClient.fetchQuery(
    guildOptions({
      guildIdLike: guildUrlName,
    }),
  );

  const pageMonoviews = await Promise.all(
    guild.pages?.map(({ pageId }) => {
      return queryClient.fetchQuery({
        queryKey: ["withPageId", "page", "monoview", pageId],
        queryFn: () =>
          fetchGuildApiData(
            `page/monoview/${pageId}`,
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          ) as any,
      });
    }),
  );

  for (const pageMonoview of pageMonoviews) {
    queryClient.setQueryData(
      ["page", "monoview", pageMonoview.data.urlName || "home"],
      pageMonoview.data,
    );
  }

  queryClient.removeQueries({ queryKey: ["withPageId"] });

  //await Promise.all([
  //  queryClient.prefetchQuery(userOptions()),
  //  queryClient.prefetchQuery(pageBatchOptions({ guildIdLike: guildUrlName })),
  //  queryClient.prefetchQuery(
  //    guildOptions({
  //      guildIdLike: guildUrlName,
  //    }),
  //  ),
  //]);
  //
  //const pageBatch = queryClient.getQueryData(
  //  pageBatchOptions({ guildIdLike: guildUrlName }).queryKey,
  //);
  //const roleBatchOptionsCollection = pageBatch?.map((page) => {
  //  return roleBatchOptions({
  //    pageIdLike: page.urlName!,
  //    guildIdLike: guildUrlName,
  //  });
  //});
  //
  //if (roleBatchOptionsCollection) {
  //  await Promise.all(
  //    roleBatchOptionsCollection.map((c) => queryClient.prefetchQuery(c)),
  //  );
  //}
  //
  //const guild = queryClient.getQueryState(
  //  guildOptions({
  //    guildIdLike: guildUrlName,
  //  }).queryKey,
  //);
  //
  //if (guild?.error || !guild?.data) {
  //  throw new Error(`Failed to fetch guild ${guild?.error?.status || ""}`);
  //}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="py-16">
        <div className="flex flex-col items-stretch pb-4 md:flex-row md:justify-between">
          <div className="w-full space-y-4">
            <div className="flex w-full flex-col items-stretch justify-between gap-8 md:flex-row md:items-center">
              <div className="flex max-w-prose items-center gap-4">
                <GuildImage
                  name={guild.name}
                  imageUrl={guild.imageUrl}
                  className="size-20 rounded-full border"
                />
                <h1 className="line-clamp-2 text-pretty font-bold font-display text-3xl tracking-tight sm:text-4xl md:line-clamp-1 lg:text-5xl">
                  {guild.name}
                </h1>
              </div>

              <Suspense fallback={<ActionButtonSkeleton />}>
                <ActionButton />
              </Suspense>
            </div>
            <p className="line-clamp-3 max-w-prose text-balance text-lg leading-relaxed">
              {guild.description}
            </p>
          </div>
        </div>

        <Suspense fallback={<GuildTabsSkeleton />}>
          <GuildTabs />
        </Suspense>

        {children}
      </main>
    </HydrationBoundary>
  );
};

export default GuildLayout;
