import { Box, Portal } from "@chakra-ui/react"
import useColorPalette from "hooks/useColorPalette"
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react"

type ColorContext = {
  localColor?: string
  setLocalColor: (newColor: string) => void
}

type Props = {
  color?: string
}

const ColorContext = createContext<ColorContext | null>(null)

const ColorProvider = ({
  color = "#000000",
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  const colorPaletteProviderElementRef = useRef(null)
  // localColor will change when the user picks a new color in the ColorPicker
  const [localColor, setLocalColor] = useState(color || "#000000")
  const generatedColors = useColorPalette("chakra-colors-primary", localColor)

  return (
    <ColorContext.Provider
      value={{
        localColor,
        setLocalColor,
      }}
    >
      <Box ref={colorPaletteProviderElementRef} sx={generatedColors}>
        {/* using Portal with it's parent's ref so it mounts children as they would normally be,
            but ensures that modals, popovers, etc are mounted inside instead at the end of the
            body so they'll use the provided css variables */}
        {typeof window === "undefined" ? (
          children
        ) : (
          <Portal containerRef={colorPaletteProviderElementRef}>{children}</Portal>
        )}
      </Box>
    </ColorContext.Provider>
  )
}

const useColorContext = (): ColorContext => useContext(ColorContext)

export { useColorContext, ColorProvider }
