import useGuild from "components/[guild]/hooks/useGuild"
import useMatchMutate from "hooks/useMatchMutate"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { GuildFormType } from "types"
import { useFetcherWithSign } from "utils/fetcher"
import replacer from "utils/guildJsonReplacer"

type Props = {
  onSuccess?: () => void
  guildId?: string | number
}

const countFailed = (arr: Record<string, string>[]) =>
  arr.filter((req) => !!req.error).length

const getCorrelationId = (arr: Record<string, string>[]) =>
  arr.filter((req) => !!req.error)[0]?.correlationId

const useEditGuild = ({ onSuccess, guildId }: Props = {}) => {
  const guild = useGuild(guildId)

  const matchMutate = useMatchMutate()

  const showErrorToast = useShowErrorToast()
  const router = useRouter()
  const fetcherWithSign = useFetcherWithSign()

  const id = guildId ?? guild?.id

  const submit = async (data: GuildFormType) => {
    const existingFeatureFlags = guild?.featureFlags ?? []
    const existingContacts = guild?.contacts ?? []
    const existingAdmins = guild?.admins ?? []
    const { admins, featureFlags, contacts, ...guildData } = data

    const adminsToCreate = admins
      ? admins.filter(
          (admin) =>
            !existingAdmins.some(
              (existingAdmin) =>
                existingAdmin.address?.toLowerCase() === admin.address?.toLowerCase()
            )
        )
      : []

    const adminsToDelete = admins
      ? existingAdmins.filter(
          (existingAdmin) =>
            !existingAdmin?.isOwner &&
            !admins.some(
              (admin) =>
                existingAdmin.address?.toLowerCase() === admin.address?.toLowerCase()
            )
        )
      : []

    const contactsToUpdate = contacts
      ? contacts.filter((contact) => {
          if (!contact.id) return false
          const prevContact = existingContacts?.find((ec) => ec.id === contact.id)
          if (!prevContact) return false
          return (
            !!contact.id &&
            !(
              contact.id === prevContact.id &&
              contact.contact === prevContact.contact &&
              contact.type === prevContact.type
            )
          )
        })
      : []
    const contactsToCreate = contacts
      ? contacts.filter((contact) => !contact.id)
      : []
    const contactsToDelete = contacts
      ? existingContacts.filter(
          (existingContact) =>
            !contacts.some((contact) => contact.id === existingContact.id)
        )
      : []

    const featureFlagsToCreate = featureFlags
      ? featureFlags.filter((flag) => !existingFeatureFlags.includes(flag))
      : []
    const featureFlagsToDelete = featureFlags
      ? existingFeatureFlags.filter(
          (existingFlag) => !featureFlags.includes(existingFlag)
        )
      : []

    const shouldUpdateBaseGuild = guildData && Object.keys(guildData).length > 0

    const adminCreations = Promise.all(
      adminsToCreate.map((adminToCreate) =>
        fetcherWithSign([
          `/v2/guilds/${id}/admins`,
          { method: "POST", body: adminToCreate },
        ]).catch((error) => error)
      )
    )

    const adminDeletions = Promise.all(
      adminsToDelete.map((adminToDelete) =>
        fetcherWithSign([
          `/v2/guilds/${id}/admins/${adminToDelete.id}`,
          { method: "DELETE" },
        ])
          .then(() => ({ id: adminToDelete.id }))
          .catch((error) => error)
      )
    )

    const contactCreations = Promise.all(
      contactsToCreate.map((contactToCreate) =>
        fetcherWithSign([
          `/v2/guilds/${id}/contacts`,
          { method: "POST", body: contactToCreate },
        ]).catch((error) => error)
      )
    )

    const contactUpdates = Promise.all(
      contactsToUpdate.map((contactToUpdate) =>
        fetcherWithSign([
          `/v2/guilds/${id}/contacts/${contactToUpdate.id}`,
          { method: "PUT", body: contactToUpdate },
        ]).catch((error) => error)
      )
    )

    const contactDeletions = Promise.all(
      contactsToDelete.map((contactToDelete) =>
        fetcherWithSign([
          `/v2/guilds/${id}/contacts/${contactToDelete.id}`,
          { method: "DELETE" },
        ])
          .then(() => ({ id: contactToDelete.id }))
          .catch((error) => error)
      )
    )

    const featureFlagCreations = Promise.all(
      featureFlagsToCreate.map((featureFlagToCreate) =>
        fetcherWithSign([
          `/v2/guilds/${id}/feature-flags`,
          { method: "POST", body: { featureType: featureFlagToCreate } },
        ]).catch((error) => error)
      )
    )

    const featureFlagDeletions = Promise.all(
      featureFlagsToDelete.map((featureFlagToDelete) =>
        fetcherWithSign([
          `/v2/guilds/${id}/feature-flags/${featureFlagToDelete}`,
          { method: "DELETE" },
        ])
          .then(() => ({ flagType: featureFlagToDelete }))
          .catch((error) => error)
      )
    )

    const baseGuildUpdate = shouldUpdateBaseGuild
      ? fetcherWithSign([
          `/v2/guilds/${id}`,
          { method: "PUT", body: guildData },
        ]).catch((error) => error)
      : new Promise<void>((resolve) => resolve())

    const [
      adminCreationResults,
      adminDeleteResults,
      contactCreationResults,
      contactUpdateResults,
      contactDeleteResults,
      featureFlagCreationResults,
      featureFlagDeletionResults,
      guildUpdateResult,
    ] = await Promise.all([
      adminCreations,
      adminDeletions,
      contactCreations,
      contactUpdates,
      contactDeletions,
      featureFlagCreations,
      featureFlagDeletions,
      baseGuildUpdate,
    ])

    return {
      admin: {
        creations: {
          success: adminCreationResults.filter((res) => !res.error),
          failedCount: countFailed(adminCreationResults),
          correlationId: getCorrelationId(adminCreationResults),
        },
        deletions: {
          success: adminDeleteResults.filter((res) => !res.error),
          failedCount: countFailed(adminDeleteResults),
          correlationId: getCorrelationId(adminDeleteResults),
        },
      },

      contacts: {
        creations: {
          success: contactCreationResults.filter((res) => !res.error),
          failedCount: countFailed(contactCreationResults),
          correlationId: getCorrelationId(contactCreationResults),
        },
        updates: {
          success: contactUpdateResults.filter((res) => !res.error),
          failedCount: countFailed(contactUpdateResults),
          correlationId: getCorrelationId(contactUpdateResults),
        },
        deletions: {
          success: contactDeleteResults.filter((res) => !res.error),
          failedCount: countFailed(contactDeleteResults),
          correlationId: getCorrelationId(contactDeleteResults),
        },
      },

      featureFlags: {
        creations: {
          success: featureFlagCreationResults.filter((res) => !res.error),
          failedCount: countFailed(featureFlagCreationResults),
          correlationId: getCorrelationId(featureFlagCreationResults),
        },
        deletions: {
          success: featureFlagDeletionResults.filter((res) => !res.error),
          failedCount: countFailed(featureFlagDeletionResults),
          correlationId: getCorrelationId(featureFlagDeletionResults),
        },
      },

      guildUpdateResult,
    } as const
  }

  const toast = useToast()

  const useSubmitResponse = useSubmit(submit, {
    onSuccess: ({ admin, contacts, featureFlags, guildUpdateResult }) => {
      // Show success / error toasts
      if (
        admin.creations.failedCount <= 0 &&
        admin.deletions.failedCount <= 0 &&
        contacts.creations.failedCount <= 0 &&
        contacts.updates.failedCount <= 0 &&
        contacts.deletions.failedCount <= 0 &&
        featureFlags.creations.failedCount <= 0 &&
        featureFlags.deletions.failedCount <= 0 &&
        (!guildUpdateResult || (!!guildUpdateResult && !guildUpdateResult.error))
      ) {
        if (onSuccess) onSuccess()
        toast({
          title: `Guild successfully updated!`,
          status: "success",
        })
      } else {
        if (admin.creations.failedCount > 0) {
          showErrorToast({
            error: "Failed to create some admins",
            correlationId: admin.creations.correlationId,
          })
        }
        if (admin.deletions.failedCount > 0) {
          showErrorToast({
            error: "Failed to delete some admins",
            correlationId: admin.deletions.correlationId,
          })
        }

        if (contacts.creations.failedCount > 0) {
          showErrorToast({
            error: "Failed to create some contacts",
            correlationId: contacts.creations.correlationId,
          })
        }
        if (contacts.updates.failedCount > 0) {
          showErrorToast({
            error: "Failed to update some contacts",
            correlationId: contacts.updates.correlationId,
          })
        }
        if (contacts.deletions.failedCount > 0) {
          showErrorToast({
            error: "Failed to delete some contacts",
            correlationId: contacts.deletions.correlationId,
          })
        }

        if (featureFlags.creations.failedCount > 0) {
          showErrorToast({
            error: "Failed to create some feature flags",
            correlationId: featureFlags.creations.correlationId,
          })
        }
        if (featureFlags.deletions.failedCount > 0) {
          showErrorToast({
            error: "Failed to delete some feature flags",
            correlationId: featureFlags.deletions.correlationId,
          })
        }

        if (guildUpdateResult?.error) {
          showErrorToast({
            error: "Failed to update guild data",
            correlationId: guildUpdateResult.correlationId,
          })
        }
      }

      guild.mutateGuild(
        (prev) => {
          const oldAdminsThatHaventBeenDeleted = (prev.admins ?? []).filter(
            (prevAdmin) =>
              !admin.deletions.success.some(
                (deletedAdmin) => deletedAdmin.id === prevAdmin.id
              )
          )

          const oldContactsThatHaventBeenDeletedNorUpdated = (
            prev.contacts ?? []
          ).filter(
            (prevContact) =>
              !contacts.deletions.success.some(
                (deletedContact) => deletedContact.id === prevContact.id
              ) &&
              !contacts.updates.success.some(
                (updatedContact) => updatedContact.id === prevContact.id
              )
          )

          const oldFeatureFlagsThatHaventBeenDeleted = (
            prev.featureFlags ?? []
          ).filter(
            (prevFeatureFlag) =>
              !featureFlags.deletions.success.some(
                (deletedFlag) => deletedFlag.featureType === prevFeatureFlag
              )
          )

          return {
            ...prev,
            ...(guildUpdateResult ?? {}),
            admins: [...oldAdminsThatHaventBeenDeleted, ...admin.creations.success],
            contacts: [
              ...oldContactsThatHaventBeenDeletedNorUpdated,
              ...contacts.updates.success,
              ...contacts.creations.success,
            ],
            featureFlags: [
              ...oldFeatureFlagsThatHaventBeenDeleted,
              ...featureFlags.creations.success.map(
                (createdFlag) => createdFlag.featureType
              ),
            ],
          }
        },
        {
          revalidate: false,
        }
      )

      const guildPinCacheKeysRegExp = new RegExp(
        `^/assets/guildPins/image\\?guildId=${id}&guildAction=\\d`
      )
      matchMutate(guildPinCacheKeysRegExp)

      matchMutate(/^\/guild\/address\//)
      matchMutate(/^\/guild\?order/)
      if (
        guildUpdateResult?.urlName &&
        guildUpdateResult.urlName !== guild?.urlName
      ) {
        router.push(guildUpdateResult.urlName)
      }
    },
    onError: (err) => showErrorToast(err),
  })

  return {
    ...useSubmitResponse,
    onSubmit: (data) =>
      useSubmitResponse.onSubmit(JSON.parse(JSON.stringify(data, replacer))),
  }
}

export default useEditGuild
