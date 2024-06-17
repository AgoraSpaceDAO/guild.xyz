import { Box, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { useGuildForm } from "components/[guild]/hooks/useGuildForms"
import AddCard from "components/common/AddCard"
import { useFieldArray } from "react-hook-form"
import AddExpectedAnswerModal from "./AddExpectedAnswerModal"
import ExpectedAnswerCard from "./ExpectedAnswerCard"

export type ExpectedValue =
  | { value: string }
  | { minAmount: number; maxAmount: number }

type FieldData = {
  fieldId: string
} & ExpectedValue

const SetExpectedAnswers = ({ isDisabled, formId, baseFieldPath }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { form, isLoading } = useGuildForm(formId)

  const { fields, append, remove } = useFieldArray({
    name: `${baseFieldPath}.data.answers`,
  })

  const alreadyAddedFields = fields.map((f: any) => f.fieldId)

  return (
    <Box w="full" {...(isDisabled ? { opacity: 0.5, pointerEvents: "none" } : {})}>
      <Text mb="2" fontWeight={"medium"}>
        {`Set expected answers `}
        <Text as="span" colorScheme="gray">
          (optional)
        </Text>
      </Text>
      <Stack>
        {fields?.map((field: FieldData & { id: string }, index) => (
          <ExpectedAnswerCard
            key={field.id}
            field={form?.fields?.find((f) => f.id === field.fieldId)}
            {...field}
            onRemove={() => remove(index)}
          />
        ))}
        {(!formId || fields.length < form?.fields?.length) && (
          <AddCard title="Add field" py="4" onClick={onOpen} />
        )}
      </Stack>
      <AddExpectedAnswerModal
        {...{ isOpen, onClose, formId, alreadyAddedFields }}
        onAdd={append}
      />
    </Box>
  )
}

export default SetExpectedAnswers
