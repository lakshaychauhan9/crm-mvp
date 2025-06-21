"use client";

// Form component for setting or validating encryption keys on the dashboard.
// Integrates with useEncryptionKey hook and Zustand for in-memory key storage.
import { useState } from "react";
import { useEncryptionKey } from "@/lib/useEncryptionKey";
import { useEncryptionKeyStore } from "@/lib/encryptionKeyStore";

interface KeyFormProps {
  userId: string | null;
  hasKey: boolean;
}

export function KeyForm({ userId, hasKey }: KeyFormProps) {
  const { setKey, enterKey, loading, error } = useEncryptionKey(userId);
  // const { setKey: storeKey } = useEncryptionKeyStore();
  const [passphrase, setPassphrase] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission to set or validate the encryption key.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) {
      alert("Please enter a passphrase");
      return;
    }

    setSuccess(null);
    if (!hasKey) {
      await setKey(passphrase);
      if (!error) {
        setSuccess("Encryption key set successfully!");
        setPassphrase("");
      }
    } else {
      const isValid = await enterKey(passphrase);
      if (isValid) {
        setSuccess("Passphrase validated successfully!");
        setPassphrase("");
        if (process.env.NODE_ENV === "development") {
          console.log(
            "KeyForm: Zustand key after validation:",
            useEncryptionKeyStore.getState().key
          );
        }
      } else {
        alert("Invalid passphrase");
      }
    }
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold mb-2">
        {hasKey ? "Validate Encryption Key" : "Set Encryption Key"}
      </h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter passphrase"
          className="border p-2 mb-2 w-full rounded"
          disabled={loading}
          autoComplete={hasKey ? "current-password" : "new-password"}
        />
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-2 p-2 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : hasKey ? "Validate Key" : "Set Key"}
        </button>
      </form>
    </div>
  );
}
