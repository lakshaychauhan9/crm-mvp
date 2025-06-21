// Zustand store for securely managing encryption keys in memory during a session.
// Clears key on logout to ensure no persistence.
import { create } from "zustand";

interface EncryptionKeyState {
  key: CryptoKey | null;
  setKey: (key: CryptoKey) => void;
  clearKey: () => void;
}

export const useEncryptionKeyStore = create<EncryptionKeyState>((set) => ({
  key: null,
  setKey: (key) => set({ key }),
  clearKey: () => set({ key: null }),
}));
