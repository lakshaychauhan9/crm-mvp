import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignUp redirectUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  );
}
