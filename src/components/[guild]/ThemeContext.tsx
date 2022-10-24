import { Box, Portal, useColorMode } from "@chakra-ui/react"
import Color from "color"
import useGuild from "components/[guild]/hooks/useGuild"
import useColorPalette from "hooks/useColorPalette"
import {
  createContext,
  Dispatch,
  memo,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { ThemeMode } from "types"

const ThemeContext = createContext<{
  localThemeColor: string
  setLocalThemeColor: Dispatch<SetStateAction<string>>
  localThemeMode: ThemeMode
  setLocalThemeMode: Dispatch<SetStateAction<ThemeMode>>
  localBackgroundImage: string
  setLocalBackgroundImage: Dispatch<SetStateAction<string>>
  textColor: string
} | null>(null)

const ThemeProvider = memo(({ children }: PropsWithChildren<any>): JSX.Element => {
  const { theme } = useGuild()
  const { color: themeColor, mode: themeMode, backgroundImage } = theme ?? {}
  const [localThemeColor, setLocalThemeColor] = useState(themeColor)
  const [localThemeMode, setLocalThemeMode] = useState(themeMode)
  const [localBackgroundImage, setLocalBackgroundImage] = useState(backgroundImage)
  const [textColor, setTextColor] = useState("whiteAlpha.900")
  const generatedColors = useColorPalette("chakra-colors-primary", localThemeColor)
  const { setColorMode } = useColorMode()
  const ref = useRef(null)

  // the initial value isn't enough, have to keep them in sync when they change due to SWR refetch
  useEffect(() => {
    if (themeColor) setLocalThemeColor(themeColor)
  }, [themeColor])
  useEffect(() => {
    if (themeMode) setLocalThemeMode(themeMode)
  }, [themeMode])
  useEffect(() => {
    if (backgroundImage) setLocalBackgroundImage(backgroundImage)
  }, [backgroundImage])

  useEffect(() => {
    if (localThemeMode) setColorMode(localThemeMode.toLowerCase())
  }, [localThemeMode])

  useEffect(() => {
    if (localThemeMode === "DARK" || localBackgroundImage) {
      setTextColor("whiteAlpha.900")
      return
    }
    const color = Color(localThemeColor || "white")
    setTextColor(color.luminosity() > 0.5 ? "primary.800" : "whiteAlpha.900")
  }, [localThemeMode, localThemeColor])

  return (
    <ThemeContext.Provider
      value={{
        localThemeColor,
        setLocalThemeColor,
        localThemeMode,
        setLocalThemeMode,
        localBackgroundImage,
        setLocalBackgroundImage,
        textColor,
      }}
    >
      <Box ref={ref} sx={generatedColors}>
        {/* using Portal with it's parent's ref so it mounts children as they would normally be,
          but ensures that modals, popovers, etc are mounted inside instead at the end of the
          body so they'll use the provided css variables */}
        <Portal containerRef={ref}>{children}</Portal>
      </Box>
    </ThemeContext.Provider>
  )
})

const useThemeContext = () => useContext(ThemeContext)

export { useThemeContext, ThemeProvider }
