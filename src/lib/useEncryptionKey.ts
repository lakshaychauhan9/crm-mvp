// "use client";

// // Custom hook for managing encryption key setup and validation.
// // Integrates with Supabase for storage and Zustand for in-memory key management.
// import { useState, useCallback, useEffect } from "react";
// import { createEncryptedTestValue, validatePassphrase } from "@/lib/crypto";
// import { getSupabaseBrowserClient } from "@/lib/supabase-client";
// import { useSession } from "@clerk/nextjs";
// import { useEncryptionKeyStore } from "@/lib/encryptionKeyStore";

// interface EncryptionKeyState {
//   loading: boolean;
//   error: string | null;
//   hasKey: boolean;
//   salt: string | null;
//   iv: string | null;
//   encryptedData: string | null;
// }

// export function useEncryptionKey(userId: string | null, onKeySet?: () => void) {
//   const { session } = useSession();
//   const { setKey: storeKey } = useEncryptionKeyStore();
//   const [state, setState] = useState<EncryptionKeyState>({
//     loading: false,
//     error: null,
//     hasKey: false,
//     salt: null,
//     iv: null,
//     encryptedData: null,
//   });

//   // Fetch encryption key metadata from Supabase for the given user.
//   const fetchMetadata = useCallback(async () => {
//     if (!userId || !session) {
//       setState((prev) => ({
//         ...prev,
//         error: "No user ID or session provided",
//       }));
//       return;
//     }

//     setState((prev) => ({ ...prev, loading: true }));
//     try {
//       const token = await session.getToken();
//       if (process.env.NODE_ENV === "development") {
//         console.log("useEncryptionKey: Clerk token:", {
//           token: token ? "present" : "missing",
//         });
//       }
//       if (!token) {
//         throw new Error("No Clerk token available");
//       }

//       const supabase = getSupabaseBrowserClient(token);
//       const { data, error } = await supabase
//         .from("users")
//         .select("encryption_key_salt, encryption_test_iv, encrypted_test_data")
//         .eq("id", userId)
//         .single();

//       if (error) {
//         console.error("useEncryptionKey: Fetch error:", error);
//         setState((prev) => ({ ...prev, loading: false, error: error.message }));
//         return;
//       }

//       if (process.env.NODE_ENV === "development") {
//         console.log("useEncryptionKey: Metadata fetched:", data);
//       }
//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         hasKey: !!data?.encryption_key_salt,
//         salt: data?.encryption_key_salt || null,
//         iv: data?.encryption_test_iv || null,
//         encryptedData: data?.encrypted_test_data || null,
//       }));
//     } catch (err) {
//       console.error("useEncryptionKey: Fetch error:", err);
//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         error: (err as Error).message,
//       }));
//     }
//   }, [userId, session]);

//   // Set encryption key metadata in Supabase based on user passphrase.
//   const setKey = useCallback(
//     async (passphrase: string) => {
//       if (!userId || !session) {
//         setState((prev) => ({
//           ...prev,
//           error: "No user ID or session provided",
//         }));
//         return;
//       }

//       // Prevent key override if already set.
//       if (state.hasKey) {
//         setState((prev) => ({ ...prev, error: "Encryption key already set" }));
//         return;
//       }

//       setState((prev) => ({ ...prev, loading: true }));
//       try {
//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: setKey called");
//         }
//         const { salt, iv, encryptedData } = await createEncryptedTestValue(
//           passphrase
//         );
//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: Generated test value:", {
//             salt,
//             iv,
//             encryptedData,
//           });
//         }

//         const token = await session.getToken();
//         if (!token) {
//           throw new Error("No Clerk token available");
//         }

//         const supabase = getSupabaseBrowserClient(token);
//         const { error } = await supabase
//           .from("users")
//           .update({
//             encryption_key_salt: salt,
//             encryption_test_iv: iv,
//             encrypted_test_data: encryptedData,
//             updated_at: new Date().toISOString(),
//           })
//           .eq("id", userId);

//         if (error) {
//           console.error("useEncryptionKey: Set key error:", error);
//           setState((prev) => ({
//             ...prev,
//             loading: false,
//             error: error.message,
//           }));
//           return;
//         }

//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: setKey succeeded");
//         }
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           hasKey: true,
//           salt,
//           iv,
//           encryptedData,
//           error: null,
//         }));
//         onKeySet?.(); // Trigger dashboard refresh.
//       } catch (err) {
//         console.error("useEncryptionKey: Set key error:", err);
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           error: (err as Error).message,
//         }));
//       }
//     },
//     [userId, session, state.hasKey, onKeySet]
//   );

//   // Validate user passphrase against stored metadata and store key in Zustand if valid.
//   const enterKey = useCallback(
//     async (passphrase: string) => {
//       if (!userId || !state.salt || !state.iv || !state.encryptedData) {
//         setState((prev) => ({ ...prev, error: "Missing key metadata" }));
//         return false;
//       }

//       setState((prev) => ({ ...prev, loading: true }));
//       try {
//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: enterKey called");
//         }
//         const derivedKey = await validatePassphrase(
//           passphrase,
//           state.salt,
//           state.iv,
//           state.encryptedData
//         );
//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: Passphrase validation:", !!derivedKey);
//         }

//         if (!derivedKey) {
//           setState((prev) => ({
//             ...prev,
//             loading: false,
//             error: "Invalid passphrase",
//           }));
//           return false;
//         }

//         if (process.env.NODE_ENV === "development") {
//           console.log("useEncryptionKey: Storing key in Zustand");
//           console.log(
//             "useEncryptionKey: Zustand key:",
//             useEncryptionKeyStore.getState().key
//           );
//         }
//         storeKey(derivedKey);

//         setState((prev) => ({ ...prev, loading: false, error: null }));
//         return true;
//       } catch (err) {
//         console.error("useEncryptionKey: Enter key error:", err);
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           error: (err as Error).message,
//         }));
//         return false;
//       }
//     },
//     [userId, state.salt, state.iv, state.encryptedData, storeKey]
//   );

//   useEffect(() => {
//     if (userId) {
//       fetchMetadata();
//     }
//   }, [userId, fetchMetadata]);

//   return { ...state, setKey, enterKey, fetchMetadata };
// }

"use client";

// Custom hook for managing encryption key setup and validation.
// Integrates with Supabase for storage and Zustand for in-memory key management.
import { useState, useCallback, useEffect } from "react";
import { createEncryptedTestValue, validatePassphrase } from "@/lib/crypto";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { useSession } from "@clerk/nextjs";
import { useEncryptionKeyStore } from "@/lib/encryptionKeyStore";

interface EncryptionKeyState {
  loading: boolean;
  error: string | null;
  hasKey: boolean;
  salt: string | null;
  iv: string | null;
  encryptedData: string | null;
}

export function useEncryptionKey(userId: string | null, onKeySet?: () => void) {
  const { session } = useSession();
  const { setKey: storeKey } = useEncryptionKeyStore();
  const [state, setState] = useState<EncryptionKeyState>({
    loading: true, // Start with loading true to avoid flash
    error: null,
    hasKey: false,
    salt: null,
    iv: null,
    encryptedData: null,
  });

  // Fetch encryption key metadata from Supabase for the given user.
  const fetchMetadata = useCallback(async () => {
    if (!userId || !session) {
      setState((prev) => ({
        ...prev,
        error: "No user ID or session provided",
        loading: false,
      }));
      return;
    }

    try {
      const token = await session.getToken();
      if (process.env.NODE_ENV === "development") {
        console.log("useEncryptionKey: Clerk token:", {
          token: token ? "present" : "missing",
        });
      }
      if (!token) {
        throw new Error("No Clerk token available");
      }

      const supabase = getSupabaseBrowserClient(token);
      const { data, error } = await supabase
        .from("users")
        .select("encryption_key_salt, encryption_test_iv, encrypted_test_data")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("useEncryptionKey: Fetch error:", error);
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("useEncryptionKey: Metadata fetched:", data);
      }
      setState((prev) => ({
        ...prev,
        loading: false,
        hasKey: !!data?.encryption_key_salt,
        salt: data?.encryption_key_salt || null,
        iv: data?.encryption_test_iv || null,
        encryptedData: data?.encrypted_test_data || null,
      }));
    } catch (err) {
      console.error("useEncryptionKey: Fetch error:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, [userId, session]);

  // Set encryption key metadata in Supabase based on user passphrase.
  const setKey = useCallback(
    async (passphrase: string) => {
      if (!userId || !session) {
        setState((prev) => ({
          ...prev,
          error: "No user ID or session provided",
        }));
        return;
      }

      // Prevent key override if already set.
      if (state.hasKey) {
        setState((prev) => ({ ...prev, error: "Encryption key already set" }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: setKey called");
        }
        const { salt, iv, encryptedData } = await createEncryptedTestValue(
          passphrase
        );
        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: Generated test value:", {
            salt,
            iv,
            encryptedData,
          });
        }

        const token = await session.getToken();
        if (!token) {
          throw new Error("No Clerk token available");
        }

        const supabase = getSupabaseBrowserClient(token);
        const { error } = await supabase
          .from("users")
          .update({
            encryption_key_salt: salt,
            encryption_test_iv: iv,
            encrypted_test_data: encryptedData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("useEncryptionKey: Set key error:", error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: setKey succeeded");
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          hasKey: true,
          salt,
          iv,
          encryptedData,
          error: null,
        }));
        onKeySet?.(); // Trigger dashboard refresh.
      } catch (err) {
        console.error("useEncryptionKey: Set key error:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: (err as Error).message,
        }));
      }
    },
    [userId, session, state.hasKey, onKeySet]
  );

  // Validate user passphrase against stored metadata and store key in Zustand if valid.
  const enterKey = useCallback(
    async (passphrase: string) => {
      if (!userId || !state.salt || !state.iv || !state.encryptedData) {
        setState((prev) => ({ ...prev, error: "Missing key metadata" }));
        return false;
      }

      setState((prev) => ({ ...prev, loading: true }));
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: enterKey called");
        }
        const derivedKey = await validatePassphrase(
          passphrase,
          state.salt,
          state.iv,
          state.encryptedData
        );
        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: Passphrase validation:", !!derivedKey);
        }

        if (!derivedKey) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Invalid passphrase",
          }));
          return false;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("useEncryptionKey: Storing key in Zustand");
          console.log(
            "useEncryptionKey: Zustand key:",
            useEncryptionKeyStore.getState().key
          );
        }
        storeKey(derivedKey);

        setState((prev) => ({ ...prev, loading: false, error: null }));
        return true;
      } catch (err) {
        console.error("useEncryptionKey: Enter key error:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: (err as Error).message,
        }));
        return false;
      }
    },
    [userId, state.salt, state.iv, state.encryptedData, storeKey]
  );

  useEffect(() => {
    if (userId) {
      fetchMetadata();
    }
  }, [userId, fetchMetadata]);

  return { ...state, setKey, enterKey, fetchMetadata };
}
