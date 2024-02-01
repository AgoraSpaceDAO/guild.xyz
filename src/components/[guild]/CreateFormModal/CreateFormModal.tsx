import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import { ArrowRight } from "phosphor-react"
import { FormProvider, useForm } from "react-hook-form"
import { uuidv7 } from "uuidv7"
import CreateFormForm from "./components/CreateFormForm"
import useCreateForm from "./hooks/useCreateForm"
import { CreateFormParams, FormSchema } from "./schemas"

type Props = { isOpen: boolean; onClose: () => void }

const defaultValues = {
  name: "",
  description: "",
  active: false,
  fields: [],
}

const CreateFormModal = (props: Props) => {
  const methods = useForm<CreateFormParams>({
    mode: "all",
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const { onSubmit: onCreateFormSubmit, isLoading } = useCreateForm({
    onSuccess: () => {
      methods.reset(defaultValues)
      props.onClose()
    },
  })

  const onSubmit = (data: CreateFormParams) =>
    onCreateFormSubmit({
      ...data,
      fields: data.fields.map((field) => ({
        ...field,
        id: uuidv7(),
      })),
    })

  return (
    <FormProvider {...methods}>
      <Modal {...props} size="3xl" colorScheme="dark">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create form</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <CreateFormForm />
          </ModalBody>

          <ModalFooter pt={0}>
            <Button
              colorScheme="green"
              rightIcon={<ArrowRight />}
              onClick={methods.handleSubmit(onSubmit, console.error)}
              loadingText="Creating form"
              isLoading={isLoading}
            >
              Create form & continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FormProvider>
  )
}
export default CreateFormModal
