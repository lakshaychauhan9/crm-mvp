// src/components/SignOutButton.tsx
// Handles user sign-out, clearing Clerk session and encryption key state.

"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
    >
      Sign Out
    </button>
  );
}
