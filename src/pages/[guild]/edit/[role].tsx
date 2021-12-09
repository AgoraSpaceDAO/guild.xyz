import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  HStack,
  Icon,
  Stack,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import CtaButton from "components/common/CtaButton"
import Layout from "components/common/Layout"
import EditForm from "components/[guild]/EditForm"
import useEditRole from "components/[guild]/hooks/useEditRole"
import useGuild from "components/[guild]/hooks/useGuild"
import useIsOwner from "components/[guild]/hooks/useIsOwner"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useRouter } from "next/router"
import { Check } from "phosphor-react"
import { useEffect, useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"

// If the `value` field of a requirement starts with a "[", we should try to parse it and use it as an array... (interval attribute)
const tryToParse = (value: any) => {
  if (typeof value !== "string" || !value?.startsWith("[")) return value

  try {
    const parsed = JSON.parse(value)
    return parsed
  } catch (_) {
    return value
  }
}

const RoleEditPage = (): JSX.Element => {
  const { account } = useWeb3React()
  const isOwner = useIsOwner(account)
  const router = useRouter()

  const guild = useGuild()
  const roleToEdit = useMemo(
    () =>
      guild?.roles?.find(
        (role) => role.roleId === parseInt(router.query.role?.toString())
      ),
    [guild]
  )

  const { onSubmit, isLoading, isImageLoading } = useEditRole(roleToEdit?.roleId)

  const methods = useForm({
    mode: "all",
  })

  // Since we're fetching the data on mount, this is the "best" way to populate the form with default values.
  // https://github.com/react-hook-form/react-hook-form/issues/2492
  useEffect(() => {
    if (!methods || !roleToEdit) return

    const { name, description, imageUrl, logic, requirements } = roleToEdit.role

    methods.reset({
      name,
      description,
      imageUrl,
      logic,
      requirements: requirements?.map((requirement) => ({
        active: true,
        type: requirement.type,
        chain: requirement.chain,
        address:
          requirement.type === "COIN"
            ? "0x0000000000000000000000000000000000000000"
            : requirement.address,
        key: requirement.key,
        value: tryToParse(requirement.value),
      })),
    })
  }, [methods, roleToEdit])

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  return (
    <FormProvider {...methods}>
      <Layout
        title="Edit role"
        action={
          isOwner && (
            <HStack spacing={2}>
              <Button
                rounded="2xl"
                colorScheme="alpha"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <CtaButton
                isLoading={isLoading || isImageLoading}
                colorScheme="green"
                variant="solid"
                onClick={methods.handleSubmit(onSubmit)}
                leftIcon={<Icon as={Check} />}
              >
                Save
              </CtaButton>
            </HStack>
          )
        }
      >
        {isOwner ? (
          <EditForm />
        ) : (
          <Alert status="error" mb="6" pb="5">
            <AlertIcon />
            <Stack>
              <AlertDescription position="relative" top={1} fontWeight="semibold">
                Seems like you aren't the owner of this role!
              </AlertDescription>
            </Stack>
          </Alert>
        )}
      </Layout>
    </FormProvider>
  )
}

export default RoleEditPage
