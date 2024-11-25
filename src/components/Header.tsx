import { AuthBoundary } from "./AuthBoundary";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import { Card } from "./ui/Card";

export const Header = () => (
  <header className="flex h-14 items-center justify-between gap-4 p-2">
    {/* TODO: NavMenu component */}
    <Card className="h-11 w-24" />

    <Card>
      <AuthBoundary fallback={<SignInButton variant="ghost" />}>
        <SignOutButton />
      </AuthBoundary>
    </Card>
  </header>
);
