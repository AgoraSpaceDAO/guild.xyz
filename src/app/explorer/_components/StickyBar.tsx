"use client"

import { useWeb3ConnectionManager } from "@/components/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import { Button } from "@/components/ui/Button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup"
import { cn } from "@/lib/utils"
import { Plus } from "@phosphor-icons/react"
import useIsStuck from "hooks/useIsStuck"
import useScrollspy from "hooks/useScrollSpy"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"
import { activeSectionAtom, isNavStuckAtom, isSearchStuckAtom } from "../atoms"
import { ActiveSection } from "../types"

const Nav = () => {
  const isNavStuck = useAtomValue(isNavStuckAtom)
  const isSearchStuck = useAtomValue(isSearchStuckAtom)
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom)
  const spyActiveSection = useScrollspy(Object.values(ActiveSection), 100)
  useEffect(() => {
    if (!spyActiveSection) return
    setActiveSection(spyActiveSection as ActiveSection)
  }, [spyActiveSection, setActiveSection])

  return (
    <ToggleGroup
      type="single"
      className="gap-2"
      size={isSearchStuck ? "sm" : "lg"}
      variant={isNavStuck ? "default" : "mono"}
      onValueChange={(value) => value && setActiveSection(value as ActiveSection)}
      value={activeSection}
    >
      <ToggleGroupItem
        value={ActiveSection.YourGuilds}
        className={cn("rounded-xl transition-all", {
          "rounded-lg": isSearchStuck,
        })}
        asChild
      >
        <a href={`#${ActiveSection.YourGuilds}`}>Your guilds</a>
      </ToggleGroupItem>
      <ToggleGroupItem
        value={ActiveSection.ExploreGuilds}
        className={cn("rounded-xl transition-all", {
          "rounded-lg": isSearchStuck,
        })}
        asChild
      >
        <a href={`#${ActiveSection.ExploreGuilds}`}>Explore guilds</a>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const CreateGuildLink = () => {
  const isNavStuck = useAtomValue(isNavStuckAtom)
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1.5", {
        "text-white": !isNavStuck,
      })}
    >
      <Plus />
      <span>Create guild</span>
    </Button>
  )
}

export const StickyBar = () => {
  const { isWeb3Connected } = useWeb3ConnectionManager()
  const setIsNavStuck = useSetAtom(isNavStuckAtom)
  const isSearchStuck = useAtomValue(isSearchStuckAtom)
  const { ref: navToggleRef } = useIsStuck(setIsNavStuck)

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex h-16 w-full items-center transition-all",
        {
          "h-12": isSearchStuck,
        }
      )}
      ref={navToggleRef}
    >
      <div className="relative flex w-full items-center justify-between">
        <Nav />
        {isWeb3Connected && <CreateGuildLink />}
      </div>
    </div>
  )
}
