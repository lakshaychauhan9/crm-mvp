import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
