import { Text } from "@chakra-ui/react"
import Link from "components/common/Link"

const GoogleTerms = () => (
  <Text colorScheme="gray" textAlign="center" fontSize="sm">
    This site is protected by reCAPTCHA, so the Google{" "}
    <Link
      href="https://policies.google.com/privacy"
      isExternal
      fontWeight={"semibold"}
    >
      Privacy Policy
    </Link>{" "}
    and{" "}
    <Link
      href="https://policies.google.com/terms"
      isExternal
      fontWeight={"semibold"}
    >
      Terms of Service
    </Link>{" "}
    apply
  </Text>
)

export default GoogleTerms
