import { Skeleton } from "@/components/ui/Skeleton";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import type { PropsWithChildren } from "react";

type Props = {
  isLoading?: boolean;
  error?: string;
};

export const DataBlock = ({
  isLoading,
  error,
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  if (isLoading) return <Skeleton className="inline w-24" />;

  return (
    <span className="break-words rounded-md bg-blackAlpha px-1.5 py-0.5 text-sm dark:bg-blackAlpha-hard">
      {error && (
        <Warning
          weight="bold"
          className="-top-px relative mr-1.5 inline-flex text-icon-warning"
        />
      )}
      <span className="font-mono">{children}</span>
    </span>
  );
};
