"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import type { CreateGuildForm as CreateGuildFormType } from "@/lib/schemas/guild";

export const CreateGuildForm = () => {
  const { control } = useFormContext<CreateGuildFormType>();

  return (
    <>
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

      <FormField
        control={control}
        name="contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail address</FormLabel>
            <FormControl>
              <Input size="lg" {...field} />
            </FormControl>

            <FormErrorMessage />
          </FormItem>
        )}
      />
    </>
  );
};
