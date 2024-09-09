import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react"

type PolygonProps = PropsWithChildren<{
  sides: number
  color?: string
  className?: string
}>

export const Polygon = ({ sides, color, className }: PolygonProps) => {
  const angleStep = (2 * Math.PI) / sides
  const radius = 38
  const points = Array.from({ length: sides }, (_, i) => {
    const x = 50 + radius * Math.cos(i * angleStep)
    const y = 50 + radius * Math.sin(i * angleStep)
    return `${x},${y}`
  }).join(" ")

  return (
    <svg viewBox={"0 0 100 100"} className={className}>
      <polygon
        className={cn({ "fill-primary stroke-primary": !color })}
        points={points}
        stroke={color}
        fill={color}
        strokeWidth="22"
        strokeLinejoin="round"
      />
    </svg>
  )
}
