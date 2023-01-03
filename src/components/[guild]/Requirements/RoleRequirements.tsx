import { Box, Collapse, Spinner, useColorModeValue, VStack } from "@chakra-ui/react"
import React, { memo, useEffect, useRef, useState } from "react"
import { VariableSizeList } from "react-window"
import { Role } from "types"
import LogicDivider from "../LogicDivider"
import ExpandRequirementsButton from "./components/ExpandRequirementsButton"
import RequirementDisplayComponent from "./components/RequirementDisplayComponent"

type Props = {
  role: Role
}

const RoleRequirements = ({ role }: Props) => {
  const sliceIndex = (role.requirements?.length ?? 0) - 3
  const shownRequirements = (role.requirements ?? []).slice(0, 3)
  const hiddenRequirements =
    sliceIndex > 0 ? (role.requirements ?? []).slice(-sliceIndex) : []

  const [isRequirementsExpanded, setIsRequirementsExpanded] = useState(false)
  const shadowColor = useColorModeValue(
    "var(--chakra-colors-gray-300)",
    "var(--chakra-colors-gray-900)"
  )

  // Row related refs, state, and functions
  const listRef = useRef(null)
  const rowHeights = useRef<Record<number, number>>({})

  const setRowHeight = (rowIndex: number, rowHeight: number) => {
    listRef.current.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [rowIndex]: rowHeight }
  }

  const Row = memo(({ index, style }: any) => {
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!rowRef.current) return
      setRowHeight(index, rowRef.current.clientHeight)
    }, [rowRef])

    return (
      <Box style={style}>
        <Box ref={rowRef}>
          <RequirementDisplayComponent requirement={hiddenRequirements[index]} />
          {index < hiddenRequirements.length - 1 && (
            <LogicDivider logic={role.logic} />
          )}
        </Box>
      </Box>
    )
  })

  if (!role.requirements?.length)
    return (
      <VStack>
        <Spinner />
      </VStack>
    )

  if (role.requirements.length > 10)
    return (
      <>
        <Box
          sx={{
            maskImage: `linear-gradient(to top, transparent 0%, black 5%, black 95%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to top, transparent 0%, black 5%, black 95%, transparent 100%)`,
          }}
        >
          <VariableSizeList
            ref={listRef}
            height={318}
            itemCount={hiddenRequirements.length}
            itemSize={(i) => rowHeights.current[i] ?? 106}
            className="custom-scrollbar"
            style={{
              paddingRight: "0.5rem",
            }}
          >
            {Row}
          </VariableSizeList>
        </Box>

        <Box
          position="absolute"
          bottom={{ base: 8, md: 0 }}
          left={0}
          right={0}
          height={6}
          bgGradient={`linear-gradient(to top, ${shadowColor}, transparent)`}
          pointerEvents="none"
          opacity={0.6}
        />
      </>
    )

  return (
    <VStack spacing="0">
      {shownRequirements.map((requirement, i) => (
        <React.Fragment key={i}>
          <RequirementDisplayComponent requirement={requirement} />
          {i < shownRequirements.length - 1 && <LogicDivider logic={role.logic} />}
        </React.Fragment>
      ))}

      <Collapse
        in={isRequirementsExpanded}
        animateOpacity={false}
        style={{ width: "100%" }}
      >
        {hiddenRequirements.map((requirement, i) => (
          <React.Fragment key={i}>
            {i === 0 && <LogicDivider logic={role.logic} />}
            <RequirementDisplayComponent requirement={requirement} />
            {i < hiddenRequirements.length - 1 && (
              <LogicDivider logic={role.logic} />
            )}
          </React.Fragment>
        ))}
      </Collapse>

      {hiddenRequirements.length > 0 && (
        <>
          <ExpandRequirementsButton
            logic={role.logic}
            hiddenRequirements={hiddenRequirements.length}
            isRequirementsExpanded={isRequirementsExpanded}
            setIsRequirementsExpanded={setIsRequirementsExpanded}
          />
          <Box
            position="absolute"
            bottom={{ base: 8, md: 0 }}
            left={0}
            right={0}
            height={6}
            bgGradient={`linear-gradient(to top, ${shadowColor}, transparent)`}
            pointerEvents="none"
            opacity={isRequirementsExpanded ? 0 : 0.6}
            transition="opacity 0.2s ease"
          />
        </>
      )}
    </VStack>
  )
}

export default RoleRequirements
