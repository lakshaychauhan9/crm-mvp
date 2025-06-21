// "use client";

// import { useState, useEffect } from "react"; // Add useEffect
// import { useUser } from "@clerk/nextjs";
// import { encrypt } from "@/lib/crypto";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2, Trash2, Edit2 } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LockedContent from "./LockedContent";
// import { useUIStore, useDataStore } from "@/lib/store";
// import { Strategy } from "@/lib/types";

// export default function StrategyManager() {
//   const { isSignedIn } = useUser();
//   const { userKey, error: storeError } = useUIStore();
//   const { strategies, hasFetched, fetchInitialData } = useDataStore(); // Add fetchInitialData
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editStrategy, setEditStrategy] = useState<Strategy | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//   });

//   // Fetch data on mount if userKey exists
//   useEffect(() => {
//     if (isSignedIn && userKey && !hasFetched) {
//       console.log("StrategyManager: Triggering fetchInitialData");
//       fetchInitialData();
//     }
//   }, [isSignedIn, userKey, hasFetched, fetchInitialData]);

//   console.log("StrategyManager: strategies:", strategies);

//   const handleEdit = (strategy: Strategy) => {
//     if (strategy.decrypted_data && "error" in strategy.decrypted_data) {
//       setError("Cannot edit: Decryption failed");
//       return;
//     }
//     setEditStrategy(strategy);
//     setFormData({
//       name: strategy.decrypted_data?.name || "",
//       description: strategy.decrypted_data?.description || "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const payload = { id };
//       console.log("StrategyManager: DELETE /api/strategies:", payload);
//       const res = await fetch("/api/strategies", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           "X-User-Key": userKey || "",
//         },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log("StrategyManager: DELETE response:", result);
//       if (!res.ok) throw new Error(result.error || "Failed to delete strategy");
//       fetchInitialData(); // Refresh data
//     } catch (err) {
//       setError((err as Error).message || "Failed to delete strategy");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!userKey) {
//       setError("Encryption key required");
//       return;
//     }
//     if (!formData.name) {
//       setError("Name is required");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const dataToEncrypt = {
//         name: formData.name,
//         description: formData.description || null,
//       };
//       let encryptedData, iv, salt;
//       try {
//         const result = await encrypt(JSON.stringify(dataToEncrypt), userKey);
//         encryptedData = result.encryptedData;
//         iv = result.iv;
//         salt = result.salt;
//       } catch (encryptErr) {
//         console.error("StrategyManager: Encryption failed:", encryptErr);
//         throw new Error("Failed to encrypt strategy data");
//       }
//       if (!encryptedData) {
//         throw new Error("Encryption produced no data");
//       }
//       const payload = {
//         id: editStrategy?.id || null,
//         encrypted_data: encryptedData,
//         iv,
//         salt,
//         userKey, // Include userKey in payload
//       };
//       console.log("StrategyManager: Sending to /api/strategies:", payload);
//       const res = await fetch("/api/strategies", {
//         method: editStrategy ? "PUT" : "POST",
//         headers: { "Content-Type": "application/json", "X-User-Key": userKey },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log(
//         "StrategyManager:",
//         editStrategy ? "PUT" : "POST",
//         "response:",
//         result
//       );
//       if (!res.ok)
//         throw new Error(
//           result.error || `Failed to save strategy: ${res.statusText}`
//         );
//       fetchInitialData(); // Refresh data
//       setIsModalOpen(false);
//       setFormData({ name: "", description: "" });
//       setEditStrategy(null);
//     } catch (err) {
//       setError((err as Error).message || "Failed to save strategy");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   if (!isSignedIn)
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Please sign in to view this page
//       </div>
//     );

//   return (
//     <LockedContent>
//       <div className="mb-6">
//         <Button
//           onClick={() => {
//             setEditStrategy(null);
//             setFormData({ name: "", description: "" });
//             setIsModalOpen(true);
//           }}
//           className="bg-primary text-primary-foreground hover:bg-primary/90"
//         >
//           Add Strategy
//         </Button>
//       </div>
//       {isModalOpen && (
//         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>
//                 {editStrategy ? "Edit Strategy" : "Add Strategy"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editStrategy
//                   ? "Update strategy details."
//                   : "Add a new strategy. Name is required."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="name">Name</Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Input
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                 />
//               </div>
//               {(error || storeError) && (
//                 <p className="text-red-500">{error || storeError}</p>
//               )}
//               <DialogFooter>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsModalOpen(false)}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={loading}>
//                   {loading ? "Saving..." : "Save"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       )}
//       <Card>
//         <CardHeader>
//           <CardTitle>Strategies</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {!hasFetched && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
//           {hasFetched && strategies.length === 0 && !error && !storeError && (
//             <p>No strategies found</p>
//           )}
//           {(error || storeError) && (
//             <p className="text-red-500 mt-4">{error || storeError}</p>
//           )}
//           {strategies.some(
//             (s) => s.decrypted_data && "error" in s.decrypted_data
//           ) && (
//             <p className="text-red-500 mt-4">
//               Some strategies failed to decrypt. Check your encryption key.
//             </p>
//           )}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {strategies.map((strategy) => (
//               <Card key={strategy.id} className="w-full max-w-sm">
//                 <CardContent className="p-4">
//                   {"error" in (strategy.decrypted_data || {}) ? (
//                     <span className="text-red-500">Decryption failed</span>
//                   ) : (
//                     <div className="space-y-1">
//                       <p className="font-medium">
//                         {strategy.decrypted_data?.name || "Untitled"}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {strategy.decrypted_data?.description || ""}
//                       </p>
//                       <div className="flex space-x-2 mt-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleEdit(strategy)}
//                           disabled={loading}
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleDelete(strategy.id)}
//                           disabled={loading}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </LockedContent>
//   );
// }

/**
 * StrategyManager component for Client Tracker (Client Component).
 * Manages strategy CRUD operations with encrypted data.
 * Why: Provides UI for creating, editing, deleting strategies.
 * How: Uses Clerk, Zustand, Supabase via API routes, AES-256-CBC.
 * Changes:
 * - Created to match PitchDeckManager structure.
 * - Added null checks and error handling.
 * - Supports basic CRUD with encryption.
 */
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { encrypt } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LockedContent from "./LockedContent";
import { useUIStore, useDataStore } from "@/lib/store";
import { Strategy } from "@/lib/types";

export default function StrategyManager() {
  const { isSignedIn } = useUser();
  const { userKey, error: storeError } = useUIStore();
  const {
    strategies,
    hasDataFetched,
    fetchInitialData,
    error: dataError,
  } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStrategy, setEditStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    details: "",
  });

  console.log("StrategyManager rendering:", {
    isSignedIn,
    userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
    hasDataFetched,
    strategiesCount: strategies ? strategies.length : 0,
    dataError,
  });

  useEffect(() => {
    if (isSignedIn && userKey && !hasDataFetched) {
      console.log("StrategyManager: Triggering fetchInitialData");
      fetchInitialData().finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [isSignedIn, userKey, hasDataFetched, fetchInitialData]);

  const handleEdit = (strategy: Strategy) => {
    if (strategy.decrypted_data && "error" in strategy.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      return;
    }
    setEditStrategy(strategy);
    setFormData({
      name: strategy.decrypted_data?.name || "",
      details: strategy.decrypted_data?.details || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { id };
      console.log("StrategyManager: DELETE /api/strategies:", payload);
      const res = await fetch("/api/strategies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("StrategyManager: DELETE response:", result);
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete strategy");
      }
      fetchInitialData();
    } catch (err) {
      setError((err as Error).message || "Failed to delete strategy");
      console.error("StrategyManager delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userKey) {
      setError("Encryption key required");
      return;
    }
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataToEncrypt = {
        name: formData.name,
        details: formData.details || "",
      };
      const { encrypted, iv, salt } = await encrypt(
        JSON.stringify(dataToEncrypt),
        userKey
      );
      const payload = {
        id: editStrategy?.id || null,
        encrypted_data: encrypted,
        iv,
        salt,
        userKey,
      };
      console.log("StrategyManager: Sending to /api/strategies:", payload);
      const res = await fetch("/api/strategies", {
        method: editStrategy ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("StrategyManager: Response:", result);
      if (!res.ok) {
        throw new Error(result.error || "Failed to save strategy");
      }
      fetchInitialData();
      setIsModalOpen(false);
      setFormData({ name: "", details: "" });
      setEditStrategy(null);
    } catch (err) {
      setError((err as Error).message || "Failed to save strategy");
      console.error("StrategyManager submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please sign in to view this page
      </div>
    );
  }

  return (
    <LockedContent>
      <div className="mb-6">
        <Button
          onClick={() => {
            setEditStrategy(null);
            setFormData({ name: "", details: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Strategy
        </Button>
      </div>
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editStrategy ? "Edit Strategy" : "Add Strategy"}
              </DialogTitle>
              <DialogDescription>
                {editStrategy
                  ? "Update strategy details."
                  : "Add a new strategy. Name is required."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="details">Details</Label>
                <Input
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {(error || storeError || dataError) && (
                <p className="text-red-500">
                  {error || storeError || dataError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoading && (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          )}
          {!initialLoading && !hasDataFetched && (
            <p className="text-center">Loading strategies...</p>
          )}
          {!initialLoading &&
            hasDataFetched &&
            strategies &&
            strategies.length === 0 && (
              <p className="text-center">No strategies found</p>
            )}
          {(error || storeError || dataError) && (
            <p className="text-red-500 mt-4">
              {error || storeError || dataError}
            </p>
          )}
          {!initialLoading && hasDataFetched && strategies && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="w-full max-w-sm">
                  <CardContent className="p-4">
                    {"error" in (strategy.decrypted_data || {}) ? (
                      <span className="text-red-500">Decryption failed</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium">
                          {strategy.decrypted_data?.name || "Unnamed"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {strategy.decrypted_data?.details || ""}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(strategy)}
                            disabled={loading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(strategy.id)}
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
          )}
        </CardContent>
      </Card>
    </LockedContent>
  );
}
