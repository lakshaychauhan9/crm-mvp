// /**
//  * PitchDeckManager component for Client Tracker (Client Component).
//  * Manages pitch deck CRUD operations with encrypted data.
//  * Why: Provides UI for creating, editing, and deleting pitch decks.
//  * How: Uses Clerk, Zustand, Supabase via API routes, and AES-256-CBC encryption.
//  * Changes:
//  * - Fixed pitchDecks undefined error with null check.
//  * - Used hasDataFetched instead of hasFetched.
//  * - Added loading state for initial fetch.
//  * - Simplified encryption to match crypto.ts.
//  */
// "use client";

// import { useState, useEffect } from "react";
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
// import { PitchDeck } from "@/lib/types";

// export default function PitchDeckManager() {
//   const { isSignedIn } = useUser();
//   const { userKey, error: storeError } = useUIStore();
//   const { pitchDecks, hasDataFetched, fetchInitialData } = useDataStore();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editPitchDeck, setEditPitchDeck] = useState<PitchDeck | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     file_url: "",
//   });

//   console.log("PitchDeckManager rendering:", {
//     isSignedIn,
//     userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
//     hasDataFetched,
//     pitchDecksCount: pitchDecks ? pitchDecks.length : 0,
//   });

//   useEffect(() => {
//     if (isSignedIn && userKey && !hasDataFetched) {
//       console.log("PitchDeckManager: Triggering fetchInitialData");
//       fetchInitialData().finally(() => setInitialLoading(false));
//     } else {
//       setInitialLoading(false);
//     }
//   }, [isSignedIn, userKey, hasDataFetched, fetchInitialData]);

//   const handleEdit = (deck: PitchDeck) => {
//     if (deck.decrypted_data && "error" in deck.decrypted_data) {
//       setError("Cannot edit: Decryption failed");
//       return;
//     }
//     setEditPitchDeck(deck);
//     setFormData({
//       title: deck.decrypted_data?.title || "",
//       description: deck.decrypted_data?.description || "",
//       file_url: deck.decrypted_data?.file_url || "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const payload = { id };
//       console.log("PitchDeckManager: DELETE /api/pitch-decks:", payload);
//       const res = await fetch("/api/pitch-decks", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           "X-User-Key": userKey || "",
//         },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log("PitchDeckManager: DELETE response:", result);
//       if (!res.ok) {
//         throw new Error(result.error || "Failed to delete pitch deck");
//       }
//       fetchInitialData();
//     } catch (err) {
//       setError((err as Error).message || "Failed to delete pitch deck");
//       console.error("PitchDeckManager delete error:", err);
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
//     if (!formData.title) {
//       setError("Title is required");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const dataToEncrypt = {
//         title: formData.title,
//         description: formData.description || "",
//         file_url: formData.file_url || "",
//       };
//       const { encrypted, salt } = await encrypt(
//         JSON.stringify(dataToEncrypt),
//         userKey
//       );
//       const payload = {
//         id: editPitchDeck?.id || null,
//         title: formData.title,
//         content: JSON.stringify(dataToEncrypt),
//       };
//       console.log("PitchDeckManager: Sending to /api/pitch-decks:", payload);
//       const res = await fetch("/api/pitch-decks", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "X-User-Key": userKey },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log("PitchDeckManager: Response:", result);
//       if (!res.ok) {
//         throw new Error(
//           result.error || `Failed to save pitch deck: ${res.statusText}`
//         );
//       }
//       fetchInitialData();
//       setIsModalOpen(false);
//       setFormData({ title: "", description: "", file_url: "" });
//       setEditPitchDeck(null);
//     } catch (err) {
//       setError((err as Error).message || "Failed to save pitch deck");
//       console.error("PitchDeck submit error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   if (!isSignedIn) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Please sign in to view this page
//       </div>
//     );
//   }

//   return (
//     <LockedContent>
//       <div className="mb-6">
//         <Button
//           onClick={() => {
//             setEditPitchDeck(null);
//             setFormData({ title: "", description: "", file_url: "" });
//             setIsModalOpen(true);
//           }}
//           className="bg-blue-600 text-white hover:bg-blue-700"
//         >
//           Add Pitch Deck
//         </Button>
//       </div>
//       {isModalOpen && (
//         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {editPitchDeck ? "Edit Pitch Deck" : "Pitch Deck"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editPitchDeck
//                   ? "Update pitch deck details."
//                   : "Add a new pitch deck."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Input
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   disabled={loading}
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
//           <CardTitle>Pitch Decks</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {initialLoading && (
//             <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//           )}
//           {!initialLoading && (!hasDataFetched || !pitchDecks) && (
//             <p>Loading pitch decks...</p>
//           )}
//           {!initialLoading &&
//             hasDataFetched &&
//             pitchDecks &&
//             pitchDecks.length === 0 && <p>No pitch decks found</p>}
//           {(error || storeError) && (
//             <p className="text-red-500 mt-4">{error || storeError}</p>
//           )}
//           {!initialLoading &&
//             hasDataFetched &&
//             pitchDecks &&
//             pitchDecks.some(
//               (deck) => deck.decrypted_data && "error" in deck.decrypted_data
//             ) && (
//               <p className="text-red-500 mt-4">
//                 Some pitch decks failed to decrypt. Check your encryption key.
//               </p>
//             )}
//           {!initialLoading && hasDataFetched && pitchDecks && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {pitchDecks.map((deck) => (
//                 <Card key={deck.id} className="w-full max-w-sm">
//                   <CardContent className="p-4">
//                     {"error" in (deck.decrypted_data || {}) ? (
//                       <span className="text-red-500">Decryption failed</span>
//                     ) : (
//                       <div className="space-y-1">
//                         <p className="font-medium">
//                           {deck.decrypted_data?.title || "Untitled"}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {deck.decrypted_data?.description || ""}
//                         </p>
//                         {deck.decrypted_data?.file_url && (
//                           <p className="text-sm text-gray-500">
//                             <a
//                               href={deck.decrypted_data?.file_url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="underline"
//                             >
//                               View File
//                             </a>
//                           </p>
//                         )}
//                         <div className="flex space-x-2 mt-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleEdit(deck)}
//                             disabled={loading}
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleDelete(deck.id)}
//                             disabled={loading}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </LockedContent>
//   );
// }

/**
 * PitchDeckManager component for Client Tracker (Client Component).
 * Manages pitch deck CRUD operations with encrypted data.
 * Why: Provides UI for creating, editing, and deleting pitch decks.
 * How: Uses Clerk, Zustand, Supabase via API routes, and AES-256-CBC encryption.
 * Changes:
 * - Aligned POST/PUT payload with pitch-decks/route.ts (userKey in body).
 * - Fixed TypeScript for decrypted_data.title.
 * - Added null checks and loading states.
 */
// "use client";

// import { useState, useEffect } from "react";
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
// import { PitchDeck } from "@/lib/types";

// export default function PitchDeckManager() {
//   const { isSignedIn } = useUser();
//   const { userKey, error: storeError } = useUIStore();
//   const { pitchDecks, hasDataFetched, fetchInitialData } = useDataStore();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editPitchDeck, setEditPitchDeck] = useState<PitchDeck | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     file_url: "",
//   });

//   console.log("PitchDeckManager rendering:", {
//     isSignedIn,
//     userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
//     hasDataFetched,
//     pitchDecksCount: pitchDecks ? pitchDecks.length : 0,
//   });

//   useEffect(() => {
//     if (isSignedIn && userKey && !hasDataFetched) {
//       console.log("PitchDeckManager: Triggering fetchInitialData");
//       fetchInitialData().finally(() => setInitialLoading(false));
//     } else {
//       setInitialLoading(false);
//     }
//   }, [isSignedIn, userKey, hasDataFetched, fetchInitialData]);

//   const handleEdit = (deck: PitchDeck) => {
//     if (deck.decrypted_data && "error" in deck.decrypted_data) {
//       setError("Cannot edit: Decryption failed");
//       return;
//     }
//     setEditPitchDeck(deck);
//     setFormData({
//       title: deck.decrypted_data?.title || "",
//       description: deck.decrypted_data?.description || "",
//       file_url: deck.decrypted_data?.file_url || "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const payload = { id };
//       console.log("PitchDeckManager: DELETE /api/pitch-decks:", payload);
//       const res = await fetch("/api/pitch-decks", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log("PitchDeckManager: DELETE response:", result);
//       if (!res.ok) {
//         throw new Error(result.error || "Failed to delete pitch deck");
//       }
//       fetchInitialData();
//     } catch (err) {
//       setError((err as Error).message || "Failed to delete pitch deck");
//       console.error("PitchDeckManager delete error:", err);
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
//     if (!formData.title) {
//       setError("Title is required");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const dataToEncrypt = {
//         title: formData.title,
//         description: formData.description || "",
//         file_url: formData.file_url || "",
//       };
//       const { encrypted, iv, salt } = await encrypt(
//         JSON.stringify(dataToEncrypt),
//         userKey
//       );
//       const payload = {
//         id: editPitchDeck?.id || null,
//         encrypted_data: encrypted,
//         iv,
//         salt,
//         userKey,
//       };
//       console.log("PitchDeckManager: Sending to /api/pitch-decks:", payload);
//       const res = await fetch("/api/pitch-decks", {
//         method: editPitchDeck ? "PUT" : "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const result = await res.json();
//       console.log("PitchDeckManager: Response:", result);
//       if (!res.ok) {
//         throw new Error(result.error || "Failed to save pitch deck");
//       }
//       fetchInitialData();
//       setIsModalOpen(false);
//       setFormData({ title: "", description: "", file_url: "" });
//       setEditPitchDeck(null);
//     } catch (err) {
//       setError((err as Error).message || "Failed to save pitch deck");
//       console.error("PitchDeckManager submit error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   if (!isSignedIn) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Please sign in to view this page
//       </div>
//     );
//   }

//   return (
//     <LockedContent>
//       <div className="mb-6">
//         <Button
//           onClick={() => {
//             setEditPitchDeck(null);
//             setFormData({ title: "", description: "", file_url: "" });
//             setIsModalOpen(true);
//           }}
//           className="bg-blue-600 text-white hover:bg-blue-700"
//         >
//           Add Pitch Deck
//         </Button>
//       </div>
//       {isModalOpen && (
//         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {editPitchDeck ? "Edit Pitch Deck" : "Add Pitch Deck"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editPitchDeck
//                   ? "Update pitch deck details."
//                   : "Add a new pitch deck. Title is required."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Input
//                   id="description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   disabled={loading}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="file_url">File URL</Label>
//                 <Input
//                   id="file_url"
//                   name="file_url"
//                   value={formData.file_url}
//                   onChange={handleChange}
//                   disabled={loading}
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
//                   {loading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                       Saving...
//                     </>
//                   ) : (
//                     "Save"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       )}
//       <Card>
//         <CardHeader>
//           <CardTitle>Pitch Decks</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {initialLoading && (
//             <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//           )}
//           {!initialLoading && (!hasDataFetched || !pitchDecks) && (
//             <p>Loading pitch decks...</p>
//           )}
//           {!initialLoading &&
//             hasDataFetched &&
//             pitchDecks &&
//             pitchDecks.length === 0 && <p>No pitch decks found</p>}
//           {(error || storeError) && (
//             <p className="text-red-500 mt-4">{error || storeError}</p>
//           )}
//           {!initialLoading &&
//             hasDataFetched &&
//             pitchDecks &&
//             pitchDecks.some(
//               (deck) => deck.decrypted_data && "error" in deck.decrypted_data
//             ) && (
//               <p className="text-red-500 mt-4">
//                 Some pitch decks failed to decrypt. Check your encryption key.
//               </p>
//             )}
//           {!initialLoading && hasDataFetched && pitchDecks && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {pitchDecks.map((deck) => (
//                 <Card key={deck.id} className="w-full max-w-sm">
//                   <CardContent className="p-4">
//                     {"error" in (deck.decrypted_data || {}) ? (
//                       <span className="text-red-500">Decryption failed</span>
//                     ) : (
//                       <div className="space-y-1">
//                         <p className="font-medium">
//                           {deck.decrypted_data?.title || "Untitled"}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {deck.decrypted_data?.description || ""}
//                         </p>
//                         {deck.decrypted_data?.file_url && (
//                           <p className="text-sm text-gray-500">
//                             <a
//                               href={deck.decrypted_data?.file_url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="underline"
//                             >
//                               View File
//                             </a>
//                           </p>
//                         )}
//                         <div className="flex space-x-2 mt-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleEdit(deck)}
//                             disabled={loading}
//                           >
//                             <Edit2 className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleDelete(deck.id)}
//                             disabled={loading}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </LockedContent>
//   );
// }

/**
 * PitchDeckManager component for Client Tracker (Client Component).
 * Manages pitch deck CRUD operations with encrypted data.
 * Why: Provides UI for creating, editing, deleting pitch decks.
 * How: Uses Clerk, Zustand, Supabase via API routes, AES-256-CBC.
 * Changes:
 * - Fixed loading state with error handling.
 * - Aligned payload with pitch-decks/route.ts (userKey in body).
 * - Improved decryption error display.
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
import { PitchDeck } from "@/lib/types";

export default function PitchDeckManager() {
  const { isSignedIn } = useUser();
  const { userKey, error: storeError } = useUIStore();
  const {
    pitchDecks,
    hasDataFetched,
    fetchInitialData,
    error: dataError,
  } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPitchDeck, setEditPitchDeck] = useState<PitchDeck | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
  });

  console.log("PitchDeckManager rendering:", {
    isSignedIn,
    userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
    hasDataFetched,
    pitchDecksCount: pitchDecks ? pitchDecks.length : 0,
    dataError,
  });

  useEffect(() => {
    if (isSignedIn && userKey && !hasDataFetched) {
      console.log("PitchDeckManager: Triggering fetchInitialData");
      fetchInitialData().finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [isSignedIn, userKey, hasDataFetched, fetchInitialData]);

  const handleEdit = (deck: PitchDeck) => {
    if (deck.decrypted_data && "error" in deck.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      return;
    }
    setEditPitchDeck(deck);
    setFormData({
      title: deck.decrypted_data?.title || "",
      description: deck.decrypted_data?.description || "",
      file_url: deck.decrypted_data?.file_url || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { id };
      console.log("PitchDeckManager: DELETE /api/pitch-decks:", payload);
      const res = await fetch("/api/pitch-decks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("PitchDeckManager: DELETE response:", result);
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete pitch deck");
      }
      fetchInitialData();
    } catch (err) {
      setError((err as Error).message || "Failed to delete pitch deck");
      console.error("PitchDeckManager delete error:", err);
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
    if (!formData.title) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataToEncrypt = {
        title: formData.title,
        description: formData.description || "",
        file_url: formData.file_url || "",
      };
      const { encrypted, iv, salt } = await encrypt(
        JSON.stringify(dataToEncrypt),
        userKey
      );
      const payload = {
        id: editPitchDeck?.id || null,
        encrypted_data: encrypted,
        iv,
        salt,
        userKey,
      };
      console.log("PitchDeckManager: Sending to /api/pitch-decks:", payload);
      const res = await fetch("/api/pitch-decks", {
        method: editPitchDeck ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("PitchDeckManager: Response:", result);
      if (!res.ok) {
        throw new Error(result.error || "Failed to save pitch deck");
      }
      fetchInitialData();
      setIsModalOpen(false);
      setFormData({ title: "", description: "", file_url: "" });
      setEditPitchDeck(null);
    } catch (err) {
      setError((err as Error).message || "Failed to save pitch deck");
      console.error("PitchDeckManager submit error:", err);
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
            setEditPitchDeck(null);
            setFormData({ title: "", description: "", file_url: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Pitch Deck
        </Button>
      </div>
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editPitchDeck ? "Edit Pitch Deck" : "Add Pitch Deck"}
              </DialogTitle>
              <DialogDescription>
                {editPitchDeck
                  ? "Update pitch deck details."
                  : "Add a new pitch deck. Title is required."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="file_url">File URL</Label>
                <Input
                  id="file_url"
                  name="file_url"
                  value={formData.file_url}
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
          <CardTitle>Pitch Decks</CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoading && (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          )}
          {!initialLoading && !hasDataFetched && (
            <p className="text-center">Loading pitch decks...</p>
          )}
          {!initialLoading &&
            hasDataFetched &&
            pitchDecks &&
            pitchDecks.length === 0 && (
              <p className="text-center">No pitch decks found</p>
            )}
          {(error || storeError || dataError) && (
            <p className="text-red-500 mt-4">
              {error || storeError || dataError}
            </p>
          )}
          {!initialLoading && hasDataFetched && pitchDecks && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pitchDecks.map((deck) => (
                <Card key={deck.id} className="w-full max-w-sm">
                  <CardContent className="p-4">
                    {"error" in (deck.decrypted_data || {}) ? (
                      <span className="text-red-500">Decryption failed</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium">
                          {deck.decrypted_data?.title || "Untitled"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {deck.decrypted_data?.description || ""}
                        </p>
                        {deck.decrypted_data?.file_url && (
                          <p className="text-sm text-gray-500">
                            <a
                              href={deck.decrypted_data?.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              View File
                            </a>
                          </p>
                        )}
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(deck)}
                            disabled={loading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(deck.id)}
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
