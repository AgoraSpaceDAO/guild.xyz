"use client";

import { useConfetti } from "@/components/ConfettiProvider";
import { Button } from "@/components/ui/Button";
import { GUILD_AUTH_COOKIE_NAME } from "@/config/constants";
import { fetchGuildApiAuth } from "@/lib/fetchGuildApi";
import { getCookieClientSide } from "@/lib/getCookieClientSide";
import type { CreateGuildForm, Guild } from "@/lib/schemas/guild";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

const CreateGuildButton = () => {
  const { handleSubmit } = useFormContext<CreateGuildForm>();

  const confetti = useConfetti();

  const router = useRouter();

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async (data: CreateGuildForm) => {
      const token = getCookieClientSide(GUILD_AUTH_COOKIE_NAME);

      if (!token) throw new Error("Unauthorized"); // TODO: custom errors?

      const guild = {
        ...data,
        contact: undefined,
      };

      return fetchGuildApiAuth<Guild>("guild", {
        method: "POST",
        body: JSON.stringify(guild),
      });
    },
    onError: (error) => {
      // TODO: parse the error and display it in a user-friendly way
      toast("An error occurred", {
        icon: <XCircle weight="fill" className="text-icon-error" />,
      });
      console.warn(error);
    },
    onSuccess: (res) => {
      confetti.current();
      toast("Guild successfully created", {
        description: "You're being redirected to its page",
        icon: <CheckCircle weight="fill" className="text-icon-success" />,
        duration: 5_000,
      });
      router.push(`/${res.urlName}`);
    },
  });

  return (
    <Button
      colorScheme="success"
      size="xl"
      isLoading={isPending}
      loadingText="Creating guild"
      onClick={handleSubmit((data) => onSubmit(data))}
    >
      Create guild
    </Button>
  );
};

export { CreateGuildButton };
