import {
  Alert,
  AlertDescription,
  AlertIcon,
  Flex,
  SimpleGrid,
  Stack,
  VStack,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import AddCard from "components/common/AddCard"
import ErrorAnimation from "components/common/ErrorAnimation"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import LogicPicker from "components/create-guild/LogicPicker"
import NftFormCard from "components/create-guild/NftFormCard"
import PickGuildPlatform from "components/create-guild/PickGuildPlatform"
import PoapFormCard from "components/create-guild/PoapFormCard"
import SnapshotFormCard from "components/create-guild/SnapshotFormCard"
import SubmitButton from "components/create-guild/SubmitButton"
import TokenFormCard from "components/create-guild/TokenFormCard"
import WhitelistFormCard from "components/create-guild/WhitelistFormCard"
import NameAndIcon from "components/create/NameAndIcon"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form"
import { RequirementType } from "temporaryData/types"
import slugify from "utils/slugify"

const CreateGuildPage = (): JSX.Element => {
  const { account } = useWeb3React()
  const methods = useForm({ mode: "all" })
  const [formErrors, setFormErrors] = useState(null)

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: methods.control,
    name: "requirements",
  })

  const addRequirement = (type: RequirementType) => {
    // Rendering the cards by "initialType", but the "type" field is editable inside some formcards (like in NftFormCard)
    appendRequirement({ initialType: type, type })
  }

  useEffect(() => {
    methods.register("urlName")
    methods.register("chainName", { value: "ETHEREUM" })
    methods.register("isGuild", { value: true })
  }, [])

  const guildName = useWatch({ control: methods.control, name: "name" })

  useEffect(() => {
    if (guildName) methods.setValue("urlName", slugify(guildName.toString()))
  }, [guildName])

  return (
    <FormProvider {...methods}>
      <Layout title="Create Guild">
        {account ? (
          <>
            <ErrorAnimation errors={formErrors}>
              <VStack spacing={10} alignItems="start">
                <Section title="Choose a logo and name for your Guild">
                  <NameAndIcon />
                </Section>

                <Section title="Choose a Realm">
                  <PickGuildPlatform />
                </Section>

                <Section title="Requirements logic">
                  <LogicPicker />
                </Section>

                {requirementFields.length && (
                  <Section
                    title="Set requirements"
                    description="Set up one or more requirements for your guild"
                  >
                    <SimpleGrid
                      columns={{ base: 1, md: 2, lg: 3 }}
                      spacing={{ base: 5, md: 6 }}
                    >
                      {requirementFields.map((requirementForm, i) => {
                        const type: RequirementType = methods.getValues(
                          `requirements.${i}.initialType`
                        )

                        switch (type) {
                          case "TOKEN":
                          case "ETHER":
                            return (
                              <TokenFormCard
                                key={requirementForm.id}
                                index={i}
                                onRemove={() => removeRequirement(i)}
                              />
                            )
                          case "POAP":
                            return (
                              <PoapFormCard
                                key={requirementForm.id}
                                index={i}
                                onRemove={() => removeRequirement(i)}
                              />
                            )
                          case "SNAPSHOT":
                            return (
                              <SnapshotFormCard
                                key={requirementForm.id}
                                index={i}
                                onRemove={() => removeRequirement(i)}
                              />
                            )
                          case "WHITELIST":
                            return (
                              <WhitelistFormCard
                                key={requirementForm.id}
                                index={i}
                                onRemove={() => removeRequirement(i)}
                              />
                            )
                          default:
                            return (
                              <NftFormCard
                                key={requirementForm.id}
                                index={i}
                                onRemove={() => removeRequirement(i)}
                              />
                            )
                        }
                      })}
                    </SimpleGrid>
                  </Section>
                )}

                <Section
                  title={requirementFields.length ? "Add more" : "Set requirements"}
                  description={
                    !requirementFields.length &&
                    "Set up one or more requirements for your guild"
                  }
                >
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 3 }}
                    spacing={{ base: 5, md: 6 }}
                  >
                    <AddCard
                      text="Hold an NFT"
                      onClick={() => addRequirement("NFT")}
                    />
                    <AddCard
                      text="Hold a Token"
                      onClick={() => addRequirement("TOKEN")}
                    />
                    <AddCard
                      text="Hold a POAP"
                      onClick={() => addRequirement("POAP")}
                    />
                    <AddCard
                      text="Snapshot strategy"
                      onClick={() => addRequirement("SNAPSHOT")}
                    />
                    <AddCard
                      text="Whitelist"
                      onClick={() => addRequirement("WHITELIST")}
                    />
                  </SimpleGrid>
                </Section>
              </VStack>
            </ErrorAnimation>
            <Flex justifyContent="right" mt="14">
              <SubmitButton
                onErrorHandler={(errors) =>
                  setFormErrors(errors ? Object.keys(errors) : null)
                }
              />
            </Flex>
          </>
        ) : (
          <Alert status="error" mb="6">
            <AlertIcon />
            <Stack>
              <AlertDescription position="relative" top={1}>
                Please connect your wallet in order to continue!
              </AlertDescription>
            </Stack>
          </Alert>
        )}
      </Layout>
    </FormProvider>
  )
}

export default CreateGuildPage
