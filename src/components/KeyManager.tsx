"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/lib/store";
import {
  hashKey,
  decryptData,
  saveKeyHash,
  getStoredHash,
  getEncryptedData,
} from "@/lib/keyService"; // Placeholder imports

export default function KeyManager() {
  const { userKey, setUserKey, setDecryptedData, setLoading } = useUIStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userKey) {
      handleDecryption(userKey); // Auto-decrypt on key change
    }
  }, [userKey]);

  const handleDecryption = async (key: string) => {
    setLoading(true);
    try {
      const encrypted = await getEncryptedData();
      const decrypted = await decryptData(encrypted, key);
      setDecryptedData(decrypted);
      setLoading(false);
    } catch (err) {
      setError("Decryption failed!");
      setLoading(false);
    }
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = (e.target as any).key.value;
    setLoading(true);
    setError(null);

    try {
      const storedHash = await getStoredHash();
      const keyHash = await hashKey(key);

      if (storedHash && keyHash !== storedHash) {
        setError("Invalid key!");
        setLoading(false);
        return;
      }

      if (!storedHash) {
        await saveKeyHash(keyHash); // Save for new user
      }

      setUserKey(key);
      await handleDecryption(key);
    } catch (err) {
      setError("Key processing failed!");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleKeySubmit} className="space-y-2">
      <input
        name="key"
        type="password"
        placeholder="Enter or create key"
        className="w-full p-2 border rounded"
        disabled={loading}
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Save Key"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        Create a new key if first-time user.
      </p>
    </form>
  );
}
