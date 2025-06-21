// src/components/KeyInputForm.tsx
// Manages encryption key setup and verification with clear steps: set key, verify key, decrypt, unlock.
// Uses useEncryptionKey hook for logic, rendering only key-related UI.

"use client";
import { useState } from "react";
import { useEncryptionKey } from "@/lib/useEncryptionKey";

interface KeyInputFormProps {
  initialKeyMetadata: {
    encryption_key_salt: string | null;
    encryption_test_iv: string | null;
    encrypted_test_data: string | null;
  };
}

export default function KeyInputForm({
  initialKeyMetadata,
}: KeyInputFormProps) {
  const { isFirstTimeKeySetup, status, loading, setKey, enterKey } =
    useEncryptionKey(initialKeyMetadata);
  const [passphrase, setPassphrase] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Step 1: Set or verify key.
    const success = isFirstTimeKeySetup
      ? await setKey(passphrase)
      : await enterKey(passphrase);
    if (success) {
      // Step 2: Decryption handled by validatePassphrase.
      // Step 3: Unlock triggered by isKeyEntered in dashboard/page.tsx.
      setPassphrase("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {isFirstTimeKeySetup ? "Set Encryption Key" : "Unlock Your Data"}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {isFirstTimeKeySetup
          ? "Create a secure key to encrypt your data. Keep it safe, as it cannot be recovered."
          : "Enter your key to access your encrypted data."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder={isFirstTimeKeySetup ? "Enter new key" : "Enter your key"}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : isFirstTimeKeySetup
            ? "Set Key"
            : "Unlock"}
        </button>
        {status && (
          <p
            className={`text-sm ${
              status.includes("Error") ? "text-red-600" : "text-green-600"
            } text-center`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
