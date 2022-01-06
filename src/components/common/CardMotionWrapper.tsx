import { Box, EASINGS } from "@chakra-ui/react"
import { domAnimation, LazyMotion, m } from "framer-motion"
import { PropsWithChildren } from "react"

const MotionBox = m(Box)

type Props = {
  animateOnMount?: boolean
}

const CardMotionWrapper = ({
  animateOnMount = true,
  children,
}: PropsWithChildren<Props>): JSX.Element => (
  <LazyMotion features={domAnimation}>
    <MotionBox
      layout="position"
      {...(animateOnMount && {
        initial: { opacity: 0, scale: 0.95 },
      })}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: EASINGS.easeOut },
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.1, ease: EASINGS.easeIn },
      }}
      transition={{ duration: 0.3, ease: EASINGS.easeInOut }}
      sx={{ "> *": { height: "full" } }}
    >
      {children}
    </MotionBox>
  </LazyMotion>
)

export default CardMotionWrapper
