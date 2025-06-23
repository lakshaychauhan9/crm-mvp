// Custom Clerk sign-up form with social providers and accessibility support.
// Configures Clerk's SignIn component with autocomplete and provider buttons.

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignUp
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formFieldInput__emailAddress: {
              autoComplete: "email",
            },
            formFieldInput__password: {
              autoComplete: "current-password",
            },
            formFieldInput__username: {
              autoComplete: "username",
            },
          },
        }}
      />
    </div>
  );
}
