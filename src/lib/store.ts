// /**
//  * Zustand store for Client Tracker.
//  * Manages UI state (userKey, error) and data state (clients, etc.).
//  * Why: Centralizes state management and data fetching.
//  * How: Uses Zustand for reactive state, fetches and decrypts data.
//  * Changes:
//  * - Updated to match original crypto.ts (AES-256-CBC) signatures.
//  * - Fixed decryption error handling.
//  */
// import { create } from "zustand";
// import { decrypt } from "./crypto";
// import { Client } from "./types";

// interface UIState {
//   userKey: string;
//   error: string | null;
//   setUserKey: (key: string) => void;
//   setError: (error: string | null) => void;
//   clearUserKey: () => void;
// }

// interface DataState {
//   clients: Client[];
//   hasDataFetched: boolean;
//   setClients: (clients: Client[]) => void;
//   setHasFetched: (hasDataFetched: boolean) => void;
//   fetchInitialData: () => Promise<void>;
// }

// export const useUIStore = create<UIState>((set) => ({
//   userKey:
//     typeof window !== "undefined"
//       ? sessionStorage.getItem("userKey") || ""
//       : "",
//   error: null,
//   setUserKey: (key) => {
//     console.log("Setting userKey:", key.slice(0, 4) + "...");
//     try {
//       if (typeof window !== "undefined") {
//         sessionStorage.setItem("userKey", key);
//       }
//       set({ userKey: key, error: null });
//       useDataStore.getState().setHasFetched(false);
//     } catch (err) {
//       console.error("setUserKey error:", err);
//       set({ error: "Failed to set user key" });
//     }
//   },
//   setError: (error) => set({ error }),
//   clearUserKey: () => {
//     console.log("Clearing userKey");
//     try {
//       if (typeof window !== "undefined") {
//         sessionStorage.removeItem("userKey");
//       }
//       set({ userKey: "", error: null });
//       useDataStore.getState().setHasFetched(false);
//     } catch (err) {
//       console.error("clearUserKey error:", err);
//       set({ error: "Failed to clear user key" });
//     }
//   },
// }));

// export const useDataStore = create<DataState>((set) => ({
//   clients: [],
//   hasDataFetched: false,
//   setClients: (clients) => set({ clients }),
//   setHasFetched: (hasDataFetched) => set({ hasDataFetched }),
//   fetchInitialData: async () => {
//     const { userKey } = useUIStore.getState();
//     console.log("fetchInitialData with userKey:", userKey.slice(0, 4) + "...");
//     try {
//       const clientsRes = await fetch("/api/clients", {
//         headers: { "Content-Type": "application/json", "X-User-Key": userKey },
//       });
//       const clientsResult = await clientsRes.json();
//       if (!clientsRes.ok) {
//         throw new Error(clientsResult.error || "Failed to fetch clients");
//       }
//       if (!Array.isArray(clientsResult.data)) {
//         throw new Error("Invalid clients response format");
//       }
//       console.log("Fetched raw clients:", clientsResult.data.length);

//       const decryptedClients = await Promise.all(
//         clientsResult.data.map(async (client: Client) => {
//           try {
//             if (!client.encrypted_data || !client.iv) {
//               console.error(`Invalid client data for ID ${client.id}`, {
//                 encrypted_data: !!client.encrypted_data,
//                 hasIV: !!client.iv,
//                 hasSalt: !!client.salt,
//               });
//               return {
//                 ...client,
//                 decrypted_data: { error: "Invalid client data" },
//               };
//             }
//             console.log(`Decrypting client ${client.id}`);
//             const decrypted = await decrypt(
//               client.encrypted_data,
//               userKey,
//               client.iv
//             );
//             return { ...client, decrypted_data: JSON.parse(decrypted) };
//           } catch (err) {
//             console.error(`Client decryption failed for ID ${client.id}`, {
//               error: (err as Error).message,
//               encrypted_data: client.encrypted_data?.slice(0, 20) + "...",
//               iv: client.iv?.slice(0, 20) + "...",
//               salt: client.salt?.slice(0, 20) + "...",
//             });
//             return {
//               ...client,
//               decrypted_data: { error: "Decryption failed" },
//             };
//           }
//         })
//       );
//       console.log(`Fetched ${decryptedClients.length} clients`);
//       set({ clients: decryptedClients, hasDataFetched: true });
//     } catch (err) {
//       console.error("fetchInitialData error:", err);
//       useUIStore.getState().setError((err as Error).message);
//       set({ hasDataFetched: true });
//     }
//   },
// }));
/**
 * Zustand store for Client Tracker state management.
 * Manages UI and data states, including userKey and fetched data.
 * Why: Centralizes state for clients, pitch decks, strategies.
 * How: Fetches data from API, decrypts, and updates state.
 * Changes:
 * - Added setters for clients, pitchDecks, strategies.
 * - Improved error handling to prevent hangs.
 */
// import { create } from "zustand";
// // import { decrypt } from "./crypto";
// import { Client, PitchDeck, Strategy, DataState } from "./types";

// interface UIState {
//   userKey: string | null;
//   error: string | null;
//   setUserKey: (key: string) => void;
//   setError: (error: string | null) => void;
// }

// export const useUIStore = create<UIState>((set) => ({
//   userKey: null,
//   error: null,
//   setUserKey: (key) => set({ userKey: key, error: null }),
//   setError: (error) => set({ error }),
// }));

// export const useDataStore = create<DataState>((set, get) => ({
//   clients: [],
//   pitchDecks: [],
//   strategies: [],
//   hasDataFetched: false,
//   error: null,
//   setClients: (clients: Client[]) => set({ clients }),
//   setPitchDecks: (pitchDecks: PitchDeck[]) => set({ pitchDecks }),
//   setStrategies: (strategies: Strategy[]) => set({ strategies }),
//   setHasFetched: (value: boolean) => set({ hasDataFetched: value }),
//   fetchInitialData: async () => {
//     const { userKey } = useUIStore.getState();
//     if (!userKey || get().hasDataFetched) {
//       console.log("fetchInitialData: Skipped", {
//         hasUserKey: !!userKey,
//         hasDataFetched: get().hasDataFetched,
//       });
//       return;
//     }
//     console.log("fetchInitialData: Starting");
//     set({ error: null, hasDataFetched: false });
//     try {
//       // Fetch and decrypt logic (moved to getServerSideProps)
//       console.log("fetchInitialData: Data pre-fetched server-side");
//     } catch (error) {
//       const errMsg = (error as Error).message || "Failed to fetch data";
//       set({ error: errMsg, hasDataFetched: true });
//       useUIStore.getState().setError(errMsg);
//       console.error("fetchInitialData global error:", error);
//     }
//   },
// }));

// src/lib/store.ts (Replace your existing content with this)
// src/lib/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
  // Add other client fields as needed
}

interface UIStore {
  encryptionKey: CryptoKey | null;
  isKeyEntered: boolean;
  error: string | null;
  setEncryptionKey: (key: CryptoKey) => void;
  setIsKeyEntered: (isEntered: boolean) => void;
  setError: (error: string | null) => void;
  clearEncryptionKey: () => void;
}

interface DataStore {
  clients: Client[] | null;
  hasFetched: boolean;
  dataError: string | null;
  setClients: (clients: Client[]) => void;
  setHasFetched: (hasFetched: boolean) => void;
  setDataError: (error: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      encryptionKey: null,
      isKeyEntered: false,
      error: null,
      setEncryptionKey: (key) =>
        set({ encryptionKey: key, isKeyEntered: true, error: null }),
      setIsKeyEntered: (isEntered) => set({ isKeyEntered: isEntered }),
      setError: (error) => set({ error }),
      clearEncryptionKey: () =>
        set({ encryptionKey: null, isKeyEntered: false, error: null }), // Remove replace: true
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      clients: null,
      hasFetched: false,
      dataError: null,
      setClients: (clients) => set({ clients, dataError: null }),
      setHasFetched: (hasFetched) => set({ hasFetched }),
      setDataError: (error) => set({ dataError: error }),
    }),
    {
      name: "data-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
