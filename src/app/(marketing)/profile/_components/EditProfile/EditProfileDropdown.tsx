import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import {
  ArrowsClockwise,
  DotsThreeVertical,
  Spinner,
  TrashSimple,
} from "@phosphor-icons/react"
import useUser from "components/[guild]/hooks/useUser"
import { Uploader } from "hooks/usePinata/usePinata"
import { FunctionComponent } from "react"
import { useFormContext } from "react-hook-form"
import { useDeleteProfile } from "../../_hooks/useDeleteProfile"

export const EditProfileDropdown: FunctionComponent<{ uploader: Uploader }> = ({
  uploader,
}) => {
  const { farcasterProfiles } = useUser()
  const farcasterProfile = farcasterProfiles?.at(0)
  const { setValue } = useFormContext()
  const deleteProfile = useDeleteProfile()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="-bottom-2 absolute right-0 translate-y-full"
        asChild
      >
        <Button variant="ghost" size="icon-sm">
          <DotsThreeVertical weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        {farcasterProfile && (
          <DropdownMenuItem
            className="flex gap-2 px-4 py-6 font-semibold"
            onClick={() => {
              if (farcasterProfile.username) {
                setValue("name", farcasterProfile.username, {
                  shouldValidate: true,
                })
              }
              void (async function () {
                if (!farcasterProfile.avatar) return
                const data = await (await fetch(farcasterProfile.avatar)).blob()
                const fileName = new URL(farcasterProfile.avatar).pathname
                  .split("/")
                  .at(-1)
                if (!fileName) return
                uploader.onUpload({
                  data: [new File([data], fileName)],
                  fileNames: [fileName],
                })
              })()
            }}
          >
            <ArrowsClockwise weight="bold" /> Fill data by Farcaster
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            // keep dropdown open to show loading state
            e.preventDefault()
            deleteProfile.onSubmit()
          }}
          disabled={deleteProfile.isLoading}
          className="gap-2 px-4 py-6 font-semibold text-destructive-subtle-foreground"
        >
          {deleteProfile.isLoading ? (
            <Spinner weight="bold" className="animate-spin" />
          ) : (
            <TrashSimple weight="bold" />
          )}
          Delete profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
