import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  avatarVariants,
} from "@/components/ui/Avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"
import { cn } from "@/lib/utils"
import { GuildReward, Schemas } from "@guildxyz/types"
import { Ranking } from "@phosphor-icons/react"
import { GuildAction } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPinContext"
import { env } from "env"
import useSWRImmutable from "swr/immutable"

export const ContributionCollection = ({
  collection,
  guildId,
}: { collection: Schemas["ContributionCollection"]; guildId: number }) => {
  const collectionPoint = collection.points.at(0)
  const collectionNft = collection.NFTs.at(0)
  const collectionPin = collection.pins.at(0)
  const { data: pinHash } = useSWRImmutable<string>(
    collectionPin
      ? `/v2/guilds/${guildId}/pin?guildAction=${GuildAction[collectionPin.action]}`
      : null
  )
  const pin = pinHash ? new URL(pinHash, env.NEXT_PUBLIC_IPFS_GATEWAY) : undefined
  const { data: point } = useSWRImmutable<GuildReward>(
    collectionPoint
      ? `/v2/guilds/${collectionPoint.guildId}/guild-platforms/${collectionPoint.guildPlatformId}`
      : null
  )

  return (
    <>
      {pin && (
        <Tooltip>
          <TooltipTrigger>
            <Avatar className={cn(avatarVariants({ size: "lg" }), "-ml-3 border")}>
              <AvatarImage src={pin.href} alt="avatar" width={32} height={32} />
              <AvatarFallback />
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>Minted Guild Pin</TooltipContent>
        </Tooltip>
      )}
      {collectionNft?.data.imageUrl && (
        <Tooltip>
          <TooltipTrigger>
            <Avatar className={cn(avatarVariants({ size: "lg" }), "-ml-3 border")}>
              <AvatarImage
                src={collectionNft.data.imageUrl}
                alt="avatar"
                width={32}
                height={32}
              />
              <AvatarFallback />
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            Minted NFT <strong>{collectionNft.data.name}</strong>
          </TooltipContent>
        </Tooltip>
      )}
      {point && collectionPoint && point.platformGuildData.imageUrl && (
        <>
          <Avatar className={cn(avatarVariants({ size: "lg" }), "-ml-3 border")}>
            <AvatarImage
              src={point.platformGuildData.imageUrl}
              alt="avatar"
              width={32}
              height={32}
            />
            <AvatarFallback />
          </Avatar>
          <div className="-ml-3 self-center rounded-r-lg border bg-card-secondary py-0.5 pr-2 pl-5">
            <div className="text-sm">
              {collectionPoint.totalPoints}&nbsp;
              <span className="font-extrabold">{point.platformGuildData.name}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Ranking weight="bold" />#{collectionPoint.rank}
            </div>
          </div>
        </>
      )}
    </>
  )
}
