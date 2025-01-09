import {
  fetchEntity,
  fetchPage,
  fetchPageBatch,
  fetchUser,
} from "@/lib/fetchers";
import type { WithIdLike } from "@/lib/types";
import type { Schemas } from "@guildxyz/types";
import { queryOptions } from "@tanstack/react-query";
import { fetchGuildApiData } from "./fetchGuildApi";

export const guildOptions = ({ guildIdLike }: WithIdLike<"guild">) => {
  return queryOptions({
    queryKey: ["guild", guildIdLike],
    queryFn: () => fetchEntity({ entity: "guild", idLike: guildIdLike }),
  });
};

export const pageBatchOptions = ({ guildIdLike }: WithIdLike<"guild">) => {
  return queryOptions({
    queryKey: ["page", "batch", guildIdLike],
    queryFn: () => fetchPageBatch({ guildIdLike }),
  });
};

export const pageMonoviewOptions = (props: Parameters<typeof fetchPage>[0]) => {
  return queryOptions({
    queryKey: [
      "page",
      "monoview",
      props.pageIdLike || "home",
      props.guildIdLike,
    ],
    queryFn: async () => {
      // ideally we would like to acquire this data from cache (if no better
      // method emerges for resolving urlName)
      const page = await fetchPage(props);
      return fetchGuildApiData(`page/monoview/${page.id}`).then(
        // biome-ignore lint/suspicious/noExplicitAny: TODO: types
        (data) => data as unknown as any,
      );
    },
  });
};

export const userOptions = () => {
  return queryOptions<Schemas["User"]>({
    queryKey: ["user"],
    queryFn: () => fetchUser(),
    retry: false,
  });
};
