import {
  FormControl,
  FormErrorMessage,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister } from "@lexical/utils"
import Button from "components/common/Button"
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from "lexical"
import { Link } from "phosphor-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { ensureUrlProtocol } from "utils/ensureUrlProtocol"
import { LOW_PRIORITY, getSelectedNode } from "../ToolbarPlugin"

type LinkEditorProps = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  insertLink: () => void
}

const LinkEditor = ({ isOpen, onOpen, onClose, insertLink }: LinkEditorProps) => {
  const methods = useForm<{ link: string }>({
    mode: "all",
  })

  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = methods
  const link = useWatch({ name: "link", control: control })

  const [editor] = useLexicalComposerContext()

  const initialFocusRef = useRef<HTMLInputElement>()
  const [lastSelection, setLastSelection] = useState(null)
  const [shouldOpenEditor, setShouldOpenEditor] = useState(false)

  const checkLinkValid = (link: string) => {
    if (!link) return true
    const url = ensureUrlProtocol(link)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setValue("link", parent.getURL())
        setShouldOpenEditor(true)
      } else if ($isLinkNode(node)) {
        setValue("link", node.getURL())
        setShouldOpenEditor(true)
      } else {
        setValue("link", "")
        setShouldOpenEditor(false)
      }
    }

    const nativeSelection = window.getSelection()
    const rootElement = editor.getRootElement()

    if (
      selection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      setLastSelection(selection)
    } else {
      setLastSelection(null)
      setValue("link", "")
    }

    return true
  }, [editor])

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            updateLinkEditor()
          })
        }),

        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            updateLinkEditor()
            return true
          },
          LOW_PRIORITY
        )
      ),
    [editor, updateLinkEditor]
  )

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor()
    })
  }, [editor, updateLinkEditor])

  const addLink = () => {
    if (!lastSelection) return
    editor.dispatchCommand(
      TOGGLE_LINK_COMMAND,
      !!link ? ensureUrlProtocol(link) : null
    )
    onClose()
  }

  return (
    <FormProvider {...methods}>
      <Popover
        initialFocusRef={initialFocusRef}
        isOpen={isOpen}
        onClose={onClose}
        placement="top"
      >
        <PopoverTrigger>
          <IconButton
            onClick={shouldOpenEditor ? onOpen : insertLink}
            isActive={isOpen}
            aria-label="Insert Link"
            icon={<Link />}
          />
        </PopoverTrigger>

        <PopoverContent>
          <PopoverHeader
            px={2}
            pt={2}
            pb={0}
            fontWeight="semibold"
            fontSize="sm"
            border="none"
          >
            Edit link
          </PopoverHeader>

          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody p={2}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addLink
              }}
            >
              <FormControl isInvalid={!!errors.link}>
                <HStack>
                  <Input
                    ref={initialFocusRef}
                    size="sm"
                    placeholder="https://example.com"
                    {...register("link", {
                      validate: (val) => checkLinkValid(val) || "Invalid link!",
                    })}
                  />

                  <Button
                    size="sm"
                    variant="solid"
                    flexShrink={0}
                    borderRadius="lg"
                    onClick={addLink}
                    isDisabled={!!errors.link}
                    type="submit"
                  >
                    Save
                  </Button>
                </HStack>

                <FormErrorMessage>{errors.link?.message}</FormErrorMessage>
              </FormControl>
            </form>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </FormProvider>
  )
}

export default LinkEditor
