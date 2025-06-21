// /**
//  * ClientRoot component for Client Tracker (Client Component).
//  * Wraps dashboard routes, checks auth and userKey, and shows KeyPromptModal.
//  * Why: Ensures protected routes require userKey while showing sidebar/header.
//  * How: Uses Clerk for auth, Zustand for userKey, and Next.js path for route checks.
//  * Changes:
//  * - Ensured modal closes after hasDataFetched: true.
//  * - Added debug logs for modal state.
//  */
// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { usePathname } from "next/navigation";
// import KeyPromptModal from "./KeyPromptModal";
// import { useUIStore, useDataStore } from "@/lib/store";

// export default function ClientRoot({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { isSignedIn } = useUser();
//   const { userKey } = useUIStore();
//   const { hasDataFetched, clients } = useDataStore();
//   const pathname = usePathname();
//   const [showKeyModal, setShowKeyModal] = useState(false);

//   console.log("ClientRoot rendering:", {
//     isSignedIn,
//     userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
//     hasDataFetched,
//     clientsCount: clients.length,
//     pathname,
//     showKeyModal,
//   });

//   useEffect(() => {
//     console.log("ClientRoot useEffect running:", {
//       isSignedIn,
//       userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
//       hasDataFetched,
//       pathname,
//     });

//     if (!isSignedIn) {
//       console.log("ClientRoot: User not signed in");
//       return;
//     }

//     const protectedRoutes = [
//       "/dashboard",
//       "/dashboard/pitch-decks",
//       "/dashboard/strategies",
//     ];

//     const normalizedPath = pathname ? pathname.replace(/\/$/, "") : "";
//     const needsKey =
//       protectedRoutes.includes(normalizedPath) ||
//       protectedRoutes.some((route) => normalizedPath.startsWith(route + "/"));

//     const shouldShowModal = needsKey && (!userKey || !hasDataFetched);
//     console.log("ClientRoot: Modal check", {
//       normalizedPath,
//       needsKey,
//       hasUserKey: !!userKey,
//       hasDataFetched,
//       isSignedIn,
//       shouldShowModal,
//     });

//     setShowKeyModal(shouldShowModal);
//   }, [isSignedIn, userKey, hasDataFetched, pathname]);

//   if (!isSignedIn) {
//     console.log("ClientRoot: Rendering sign-in prompt");
//     return (
//       <div className="flex justify-center items-center h-screen bg-red-100">
//         Please sign in! (ClientRoot)
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen">
//       <div className="fixed top-0 right-0 bg-yellow-200 p-2 text-sm z-[2000]">
//         ClientRoot Active: {pathname} | Key: {userKey ? "Set" : "None"} |
//         Fetched: {hasDataFetched ? "true" : "false"} | Clients: {clients.length}
//       </div>
//       {showKeyModal && (
//         <KeyPromptModal
//           onKeySet={() => {
//             console.log("ClientRoot: Key set, hiding KeyPromptModal");
//             setShowKeyModal(!hasDataFetched); // Close only if data fetched
//           }}
//         />
//       )}
//       {children}
//     </div>
//   );
// }
/**
 * ClientRoot component for Client Tracker (Client Component).
 * Renders client list and ClientModal for CRUD operations.
 * Why: Centralizes client management UI.
 * How: Uses Zustand for state, Clerk for auth, Shadcn for UI.
 * Changes:
 * - Enhanced error display for fetch/decrypt failures.
 * - Improved logging for hasDataFetched issues.
 * - Kept ClientModal onClose fix.
 */
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUIStore, useDataStore } from "@/lib/store";
import ClientModal from "./ClientModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import { Client } from "@/lib/types";

export default function ClientRoot() {
  const { isSignedIn } = useUser();
  const { userKey, error: storeError } = useUIStore();
  const {
    clients,
    hasDataFetched,
    fetchInitialData,
    error: dataError,
  } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  console.log("ClientRoot rendering:", {
    isSignedIn,
    userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
    hasDataFetched,
    clientsCount: clients.length,
    dataError,
    storeError,
  });

  useEffect(() => {
    if (isSignedIn && userKey && !hasDataFetched) {
      console.log("ClientRoot: Triggering fetchInitialData");
      fetchInitialData().finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [isSignedIn, userKey, hasDataFetched, fetchInitialData]);

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete client");
      }
      fetchInitialData();
    } catch (err) {
      console.error("Client delete error:", err);
      useUIStore
        .getState()
        .setError((err as Error).message || "Failed to delete client");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    console.log("ClientRoot: Closing ClientModal");
    setIsModalOpen(false);
    setEditClient(null);
  };

  const handleSubmitModal = () => {
    console.log("ClientRoot: ClientModal submitted");
    fetchInitialData();
  };

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please sign in to view this page
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialLoading && (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Initializing...</span>
        </div>
      )}
      {!initialLoading && !hasDataFetched && (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading clients...</span>
        </div>
      )}
      {!initialLoading && hasDataFetched && (
        <>
          <div className="mb-4">
            <Button
              onClick={() => {
                setEditClient(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Client
            </Button>
          </div>
          {isModalOpen && (
            <ClientModal
              editClient={editClient}
              onClose={handleCloseModal}
              onSubmit={handleSubmitModal}
            />
          )}
          {(storeError || dataError) && (
            <p className="text-red-500 text-center">
              Error: {storeError || dataError}
            </p>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 && (
                <p className="text-center">No clients found</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <Card key={client.id} className="w-full max-w-sm">
                    <CardContent className="p-4">
                      {"error" in (client.decrypted_data || {}) ? (
                        <span className="text-red-500">Decryption failed</span>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {client.decrypted_data?.email || "No email"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {client.decrypted_data?.first_name || ""}{" "}
                            {client.decrypted_data?.last_name || ""}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(client)}
                              disabled={loading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(client.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
