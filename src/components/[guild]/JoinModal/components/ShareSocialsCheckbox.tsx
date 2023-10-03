import { Checkbox, Icon, Link, Text, Tooltip } from "@chakra-ui/react"
import { ArrowSquareOut } from "phosphor-react"
import { useFormContext } from "react-hook-form"

const ShareSocialsCheckbox = (): JSX.Element => {
  const { setValue, watch } = useFormContext()

  const shareSocials = watch("shareSocials")

  return (
    <Checkbox
      alignItems="start"
      pb={4}
      isChecked={shareSocials}
      onChange={(e) => setValue("shareSocials", e.target.checked)}
      size="sm"
    >
      <Text colorScheme="gray" mt="-5px">
        {`I agree to share my socials with the guild owner, so they can potentially
        reward me for my engagement in the community. `}
        <Tooltip label="Soon" shouldWrapChildren hasArrow>
          <Link
            href=""
            isExternal
            fontWeight={"semibold"}
            onClick={(e) => e.preventDefault()}
            opacity={0.5}
            pointerEvents={"none"}
          >
            Learn more
            <Icon as={ArrowSquareOut} ml="0.5" />
          </Link>
        </Tooltip>
      </Text>
    </Checkbox>
  )
}

export default ShareSocialsCheckbox
