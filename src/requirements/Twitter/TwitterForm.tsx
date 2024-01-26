import {
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Stack,
} from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import ControlledSelect from "components/common/ControlledSelect"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import parseFromObject from "utils/parseFromObject"
import TwitterAccountAge from "./components/TwitterAccountAge"
import TwitterAccountAgeRelative from "./components/TwitterAccountAgeRelative"
import TwitterMinimumCount from "./components/TwitterMinimumCount"
import TwitterListInput from "./components/TwitterListInput"
import TwitterTextToInclude from "./components/TwitterTextToInclude"
import TwitterTweetInput from "./components/TwitterTweetInput"
import TwitterUserInput from "./components/TwitterUserInput"
import TwitterAccountVerified from "./components/TwitterAccountVerified"

const TwitterForm = ({ baseFieldPath, field }: RequirementFormProps) => {
  const { featureFlags } = useGuild()

  const twitterRequirementTypes = [
    {
      label: "Have verified account",
      value: "TWITTER_ACCOUNT_VERIFIED",
      TwitterRequirement: TwitterAccountVerified,
    },
    {
      label: "Have at least x followers",
      value: "TWITTER_FOLLOWER_COUNT",
      TwitterRequirement: TwitterMinimumCount,
    },
    {
      label: "Follow user",
      value: "TWITTER_FOLLOW",
      TwitterRequirement: TwitterUserInput,
    },
    {
      label: "Be followed by user",
      value: "TWITTER_FOLLOWED_BY",
      TwitterRequirement: TwitterUserInput,
    },
    {
      label: "Follow at least x users",
      value: "TWITTER_FOLLOWING_COUNT",
      TwitterRequirement: TwitterMinimumCount,
    },
    {
      label: "Have at least x posts",
      value: "TWITTER_TWEET_COUNT",
      TwitterRequirement: TwitterMinimumCount,
    },
    {
      label: "Like post",
      value: "TWITTER_LIKE_V2",
      TwitterRequirement: TwitterTweetInput,
    },
    {
      label: "Repost",
      value: "TWITTER_RETWEET_V2",
      TwitterRequirement: TwitterTweetInput,
    },
    {
      label: "Account age (absolute)",
      value: "TWITTER_ACCOUNT_AGE",
      TwitterRequirement: TwitterAccountAge,
    },
    {
      label: "Account age (relative)",
      value: "TWITTER_ACCOUNT_AGE_RELATIVE",
      TwitterRequirement: TwitterAccountAgeRelative,
    },
    { label: "Have protected account", value: "TWITTER_ACCOUNT_PROTECTED" },
    {
      label: "Be a member of list",
      value: "TWITTER_LIST_MEMBER",
      TwitterRequirement: TwitterListInput,
    },
    {
      label: "Give at least x total likes",
      value: "TWITTER_LIKE_COUNT",
      TwitterRequirement: TwitterMinimumCount,
    },
    {
      label: "Have specific text in username",
      value: "TWITTER_NAME",
      TwitterRequirement: TwitterTextToInclude,
    },
    {
      label: "Have specific text in bio",
      value: "TWITTER_BIO",
      TwitterRequirement: TwitterTextToInclude,
    },
    // {
    //   label: "Follow list",
    //   value: "TWITTER_LIST_FOLLOW",
    //   TwitterRequirement: TwitterListInput,
    // },
    ...(featureFlags?.includes("TWITTER_EXTRA_REQUIREMENT")
      ? [
          {
            label: "Like tweet (legacy)",
            value: "TWITTER_LIKE",
            TwitterRequirement: TwitterTweetInput,
          },
          {
            label: "Retweet tweet (legacy)",
            value: "TWITTER_RETWEET",
            TwitterRequirement: TwitterTweetInput,
          },
        ]
      : []),
  ]

  const { errors } = useFormState()
  const { resetField } = useFormContext()

  const type = useWatch({ name: `${baseFieldPath}.type` })

  const selected = twitterRequirementTypes.find((reqType) => reqType.value === type)

  const resetFields = () => {
    resetField(`${baseFieldPath}.data.id`, { defaultValue: "" })
    resetField(`${baseFieldPath}.data.minAmount`, { defaultValue: "" })
  }

  return (
    <Stack spacing={4} alignItems="start">
      <FormControl
        isInvalid={!!parseFromObject(errors, baseFieldPath)?.type?.message}
      >
        <FormLabel>Type</FormLabel>

        <ControlledSelect
          name={`${baseFieldPath}.type`}
          rules={{ required: "It's required to select a type" }}
          options={twitterRequirementTypes}
          beforeOnChange={resetFields}
        />

        <FormErrorMessage>
          {parseFromObject(errors, baseFieldPath)?.type?.message}
        </FormErrorMessage>
      </FormControl>

      {selected?.TwitterRequirement && (
        <>
          <Divider />
          <selected.TwitterRequirement baseFieldPath={baseFieldPath} field={field} />
        </>
      )}
    </Stack>
  )
}

export default TwitterForm
