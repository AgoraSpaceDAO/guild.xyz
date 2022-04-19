import { Flex, VStack } from "@chakra-ui/react"
import { WithRumComponentContext } from "@datadog/rum-react-integration"
import { useWeb3React } from "@web3-react/core"
import ErrorAlert from "components/common/ErrorAlert"
import ErrorAnimation from "components/common/ErrorAnimation"
import Layout from "components/common/Layout"
import LinkPreviewHead from "components/common/LinkPreviewHead"
import Section from "components/common/Section"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import LogicPicker from "components/create-guild/LogicPicker"
import PickRolePlatform from "components/create-guild/PickRolePlatform"
import SetRequirements from "components/create-guild/Requirements"
import SubmitButton from "components/create-guild/SubmitButton"
import { Web3Connection } from "components/_app/Web3ConnectionManager"
import usePinata from "hooks/usePinata"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useContext, useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { GuildFormType } from "types"
import getRandomInt from "utils/getRandomInt"

const CreateGuildPage = (): JSX.Element => {
  const { account } = useWeb3React()
  const methods = useForm<GuildFormType>({
    mode: "all",
    defaultValues: {
      name: "My guild",
      imageUrl: `/guildLogos/${getRandomInt(286)}.svg`,
      chainName: "ETHEREUM",
      logic: "AND",
    },
  })
  const [formErrors, setFormErrors] = useState(null)
  const { openWalletSelectorModal, triedEager } = useContext(Web3Connection)
  const { isUploading, onUpload } = usePinata()

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  useEffect(() => {
    if (triedEager && !account) openWalletSelectorModal()
  }, [account, triedEager])

  return (
    <>
      <LinkPreviewHead path="" />
      <Layout title="Create Guild">
        {account ? (
          <FormProvider {...methods}>
            <ErrorAnimation errors={formErrors}>
              <VStack spacing={10} alignItems="start">
                <Section title="Choose a Realm">
                  <PickRolePlatform onUpload={onUpload} />
                </Section>

                <Section title="Requirements logic">
                  <LogicPicker />
                </Section>

                <SetRequirements />
              </VStack>
            </ErrorAnimation>
            <Flex justifyContent="right" mt="14">
              <SubmitButton
                isUploading={isUploading}
                onErrorHandler={(errors) => {
                  console.log(errors)
                  return setFormErrors(errors ? Object.keys(errors) : null)
                }}
              >
                Summon
              </SubmitButton>
            </Flex>
            <DynamicDevTool control={methods.control} />
          </FormProvider>
        ) : (
          <ErrorAlert label="Please connect your wallet in order to continue!" />
        )}
      </Layout>
    </>
  )
}

export default WithRumComponentContext("Create guild page", CreateGuildPage)
