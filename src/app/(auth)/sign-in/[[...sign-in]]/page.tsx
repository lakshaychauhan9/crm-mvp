// Custom Clerk sign-in form with social providers and accessibility support.
// Configures Clerk's SignIn component with autocomplete and provider buttons.
import { SignIn } from "@clerk/nextjs";

export default function CustomSignIn() {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <SignIn
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
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
            socialButtonsBlockButton: {
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              marginBottom: "8px",
            },
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
          },
        }}
      />
    </div>
  );
}
