"use client";

import { useState } from "react";
import { useEncryptionKey } from "@/lib/useEncryptionKey";

interface KeyModalsProps {
  userId: string | null;
}

export function KeyModals({ userId }: KeyModalsProps) {
  const { hasKey, setKey, enterKey, loading, error } = useEncryptionKey(userId);
  const [passphrase, setPassphrase] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    if (!passphrase) {
      alert("Please enter a passphrase");
      return;
    }

    if (!hasKey) {
      await setKey(passphrase);
      if (!error) {
        setShowModal(false);
        alert("Encryption key set successfully!");
      }
    } else {
      const isValid = await enterKey(passphrase);
      if (isValid) {
        setShowModal(false);
        alert("Passphrase validated successfully!");
      } else {
        alert("Invalid passphrase");
      }
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during operation
    setShowModal(false);
  };

  if (!showModal || !userId) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl mb-4">
          {hasKey ? "Enter Encryption Key" : "Set Encryption Key"}
        </h2>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter passphrase"
          className="border p-2 mb-4 w-full rounded"
          disabled={loading}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : hasKey ? "Validate Key" : "Set Key"}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
