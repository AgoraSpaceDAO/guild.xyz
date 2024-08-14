"use client"

import { Card } from "@/components/ui/Card"
import {
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/Form"
import { Input } from "@/components/ui/Input"
import { useFormContext } from "react-hook-form"
import { CreateGuildFormType } from "../types"
import { CreateGuildButton } from "./CreateGuildButton"
import { EmailFormField } from "./EmailFormField"

const CreateGuildCard = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateGuildFormType>()

  return (
    <Card className="flex flex-col px-5 py-6 shadow-lg md:px-6">
      <h2 className="mb-7 text-center font-display font-extrabold text-2xl">
        Begin your guild
      </h2>

      {/* <Center mb="6">
          <IconSelector
            uploader={iconUploader}
            minW={512}
            minH={512}
            onGeneratedBlobChange={async (objectURL) => {
              const generatedThemeColor = await getColorByImage(objectURL)
              setValue("theme.color", generatedThemeColor)
            }}
            boxSize={28}
          />
        </Center> */}

      <div className="mb-8 flex flex-col gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guild name</FormLabel>
              <FormControl>
                <Input size="lg" {...field} />
              </FormControl>

              <FormErrorMessage />
            </FormItem>
          )}
        />

        <EmailFormField />
      </div>

      <CreateGuildButton />
    </Card>
  )
}

export { CreateGuildCard }
