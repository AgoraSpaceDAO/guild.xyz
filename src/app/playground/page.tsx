import { Card } from "@/components/ui/Card"
import { Metadata } from "next"
import { PropsWithChildren } from "react"
import { ThemeToggle } from "../../v2/components/ThemeToggle"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Playground",
}


const Section = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-lg font-bold">{title}</h2>
    {children}
  </section>
)

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Playground</h1>

      <div className="flex flex-col items-start gap-4">
        <Section title="Theme toggle">
          <ThemeToggle />
        </Section>

        <Section title="Card">
          <Card className="p-4">This is a card</Card>
        </Section>
        <Button variant='default'>primary (default)</Button>
        <Button variant='outline'>outline</Button>
        <Button variant='ghost'>ghost</Button>
        <Button variant='accent'>accent</Button>
        <Button variant='destructive'>destructive</Button>
        <Button variant='success'>success</Button>
      </div>
    </div>
  )
}
