"use client";

// Button component for signing out users, clearing Clerk session and Zustand key.
// Redirects to the landing page after logout.
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEncryptionKeyStore } from "@/lib/encryptionKeyStore";

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { clearKey } = useEncryptionKeyStore();

  // Handle sign-out, clear encryption key from Zustand, and redirect to home.
  const handleSignOut = async () => {
    try {
      console.log(
        "SignOut: Zustand key before clear:",
        useEncryptionKeyStore.getState().key
      );
      clearKey();
      console.log(
        "SignOut: Zustand key after clear:",
        useEncryptionKeyStore.getState().key
      );
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("SignOut error:", err);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Sign Out
    </button>
  );
}
