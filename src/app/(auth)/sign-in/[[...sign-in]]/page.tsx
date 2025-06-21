// import { SignIn } from "@clerk/nextjs";

// export default function Page() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center p-24">
//       <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
//     </div>
//   );
// }

"use client";

// Custom Clerk sign-in form to add autocomplete attributes for accessibility.
import { SignIn } from "@clerk/nextjs";

export default function CustomSignIn() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <SignIn
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formFieldInput__emailAddress: {
              autoComplete: "email",
            },
            formFieldInput__password: {
              autoComplete: "current-password",
            },
          },
        }}
      />
    </div>
  );
}
