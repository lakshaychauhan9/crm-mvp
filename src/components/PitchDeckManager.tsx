"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { decrypt } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import Header from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useKey } from "@/components/KeyContext";
import { PitchDeck } from "@/lib/types";

const PitchDeckManager: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const { userKey } = useKey();
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPitchDecks = useCallback(async () => {
    if (!userKey || !isSignedIn || !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pitch-decks", {
        headers: { "Content-Type": "application/json" },
      });
      const { data } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch pitch decks");
      const decryptedDecks = await Promise.all(
        data.map(async (deck: PitchDeck) => {
          try {
            const decrypted = await decrypt(
              deck.encrypted_data,
              userKey,
              deck.iv
            );
            return { ...deck, decrypted_data: JSON.parse(decrypted) };
          } catch (err) {
            console.error(`Decryption failed for pitch deck ${deck.id}:`, err);
            return { ...deck, decrypted_data: { error: "Decryption failed" } };
          }
        })
      );
      setPitchDecks(decryptedDecks);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userKey, isSignedIn, user]);

  useEffect(() => {
    fetchPitchDecks();
  }, [fetchPitchDecks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !userKey) {
      setError("Please provide a name and encryption key");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let body: any = { name, notes, userKey };
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onload = () => {
            const base64Data = reader.result?.toString().split(",")[1];
            body.file = { name: file.name, data: base64Data };
            resolve(null);
          };
        });
      }
      if (editId) body.id = editId;
      const method = editId ? "PUT" : "POST";
      const res = await fetch("/api/pitch-decks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Operation failed");
      setName("");
      setNotes("");
      setFile(null);
      setEditId(null);
      await fetchPitchDecks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deck: PitchDeck) => {
    if (deck.decrypted_data && "error" in deck.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      return;
    }
    setEditId(deck.id);
    setName(deck.decrypted_data?.name || "");
    setNotes(deck.decrypted_data?.notes || "");
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pitch-decks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");
      await fetchPitchDecks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return <div>Please sign in to view pitch decks</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <LockedContent>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editId ? "Edit Pitch Deck" : "Add Pitch Deck"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Pitch Deck Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button type="submit" disabled={loading || !userKey}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editId ? "Update Pitch Deck" : "Add Pitch Deck"}
                  </Button>
                  {error && <p className="text-destructive">{error}</p>}
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pitch Decks</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                )}
                {pitchDecks.length === 0 && !loading && (
                  <p>No pitch decks found</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pitchDecks.map((deck) => (
                    <Card key={deck.id} className="w-full max-w-sm">
                      <CardContent className="p-4">
                        {"error" in (deck.decrypted_data || {}) ? (
                          <span className="text-destructive">
                            Decryption failed
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {deck.decrypted_data?.name}
                            </p>
                            {deck.decrypted_data?.notes && (
                              <p className="text-sm text-muted-foreground">
                                Notes: {deck.decrypted_data.notes.slice(0, 30)}
                                ...
                              </p>
                            )}
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(deck)}
                                disabled={loading}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
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
              </CardContent>
            </Card>
          </LockedContent>
        </main>
      </div>
    </div>
  );
};

export default PitchDeckManager;
