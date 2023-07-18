import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form"

const TO_FILTER_FLAG = "TO_FILTER"
const IGNORED_KEYS = new Set(["validAddresses"])

/**
 * Takes formData, and its dirtyFields flags, and returns a new object, that is a new
 * object constructed by keeping only the values of formData where dirtyFields is
 * true. It recursively travels through the entire object, so nested objects, and
 * arrays are handled. For object, that is dirty based on its fields, if it has an
 * "id" fields, it is also kept. This is because, when sending the PUT requests, we
 * need to know the id of te entity.
 *
 * @param dirtyFields FormState.dirtyFields from the form
 * @param formData Form values from handleSubmit's onValid callback
 * @returns A new object, that is a subset of formData based on dirtyFields
 */
const formDataFilterForDirtyHelper = (dirtyFields: any, formData: any) => {
  if (Array.isArray(dirtyFields)) {
    const newArr = dirtyFields
      .map((field, index) => formDataFilterForDirtyHelper(field, formData[index]))
      .filter((item) => item !== TO_FILTER_FLAG)

    return newArr.length > 0 ? newArr : TO_FILTER_FLAG
  }

  if (typeof dirtyFields === "object") {
    const newObj = Object.fromEntries(
      Object.entries(dirtyFields)
        .map(([key, value]) => [
          key,
          formDataFilterForDirtyHelper(value, formData[key]),
        ])
        .filter(([key, value]) => value !== TO_FILTER_FLAG && !IGNORED_KEYS.has(key))
    )

    const isEmpty = Object.keys(newObj).length <= 0

    // Re-attach id field to dirty objects
    if (!isEmpty && "id" in formData) {
      newObj.id = formData.id
    }

    return !isEmpty ? newObj : TO_FILTER_FLAG
  }

  // At this point dirtyFields is a boolean
  return dirtyFields && formData !== TO_FILTER_FLAG ? formData : TO_FILTER_FLAG
}

const formDataFilterForDirty = (dirtyFields: any, formData: any) => {
  const filtered = formDataFilterForDirtyHelper(dirtyFields, formData)
  return filtered === "TO_FILTER" ? null : filtered
}

const handleSubmitDirty =
  <TFieldValues extends FieldValues = FieldValues, TContext = any>(
    methods: UseFormReturn<TFieldValues, TContext>
  ) =>
  (
    onValid: SubmitHandler<Partial<TFieldValues>>,
    onInvalid?: SubmitErrorHandler<TFieldValues>
  ) =>
    methods.handleSubmit(
      (formValues) =>
        onValid(
          (formDataFilterForDirty(methods.formState.dirtyFields, formValues) ??
            {}) as Partial<TFieldValues>
        ),
      onInvalid
    )

export default handleSubmitDirty
