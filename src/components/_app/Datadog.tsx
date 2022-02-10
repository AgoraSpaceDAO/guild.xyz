import { datadogRum } from "@datadog/browser-rum"
import { RumComponentContextProvider } from "@datadog/rum-react-integration"
import { PropsWithChildren, useEffect } from "react"

const Datadog = ({ children }: PropsWithChildren<unknown>): JSX.Element => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    datadogRum.init({
      applicationId: "996b7a2a-d610-4235-a5b4-65391973ea76",
      clientToken: "pub7cf22f3b79a010363cf58c859cfa8ad8",
      site: "datadoghq.eu",
      service: "guild.xyz",
      env: "prod",
      version: "1.0.0",
      sampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: "mask-user-input",
      beforeSend: (event) => {
        if (process.env.NODE_ENV === "development") {
          console.log("DATADOG EVENT:", event)
        }
        if (event.view.url.includes("linkpreview")) return false
      },
    })
  }, [])

  return (
    <RumComponentContextProvider componentName="App">
      {children}
    </RumComponentContextProvider>
  )
}

export default Datadog
