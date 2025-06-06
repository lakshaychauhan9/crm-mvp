"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { decrypt } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import Header from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import LockedContent from "@/components/LockedContent";
import ClientModal from "@/components/ClientModal";
import { useKey } from "@/components/KeyContext";
import { Client } from "@/lib/types";

export default function Dashboard() {
  const { isSignedIn } = useUser();
  const { userKey } = useKey();
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!userKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        headers: { "Content-Type": "application/json" },
      });
      const { data } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch clients");
      const decryptedClients = await Promise.all(
        data.map(async (client: Client) => {
          try {
            const decrypted = await decrypt(
              client.encrypted_data,
              userKey,
              client.iv
            );
            return { ...client, decrypted_data: JSON.parse(decrypted) };
          } catch (err) {
            console.error(`Decryption failed for client ${client.id}:`, err);
            return {
              ...client,
              decrypted_data: { error: "Decryption failed" },
            };
          }
        })
      );
      setClients(decryptedClients);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    if (isSignedIn && userKey) fetchClients();
  }, [isSignedIn, userKey, fetchClients]);

  const handleEdit = useCallback((client: Client) => {
    if (client.decrypted_data && "error" in client.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      return;
    }
    setEditClient(client);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/clients", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Delete failed");
        await fetchClients();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchClients]
  );

  if (!isSignedIn) return <div>Please sign in to view the dashboard</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <LockedContent>
            <div className="mb-6">
              <Button
                onClick={() => {
                  setEditClient(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add Client
              </Button>
            </div>
            {isModalOpen && (
              <ClientModal
                userKey={userKey}
                editClient={editClient}
                onClose={() => setIsModalOpen(false)}
                onSubmit={() => {
                  setIsModalOpen(false);
                  fetchClients();
                }}
              />
            )}
            <Card>
              <CardHeader>
                <CardTitle>Clients</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                )}
                {clients.length === 0 && !loading && <p>No clients found</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <Card key={client.id} className="w-full max-w-sm">
                      <CardContent className="p-4">
                        {"error" in (client.decrypted_data || {}) ? (
                          <span className="text-destructive">
                            Decryption failed
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {client.decrypted_data?.first_name}{" "}
                              {client.decrypted_data?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {client.decrypted_data?.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Priority:{" "}
                              {client.decrypted_data?.priority || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {client.decrypted_data?.status || "N/A"}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(client)}
                                disabled={loading}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
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
                {error && <p className="text-destructive mt-4">{error}</p>}
              </CardContent>
            </Card>
          </LockedContent>
        </main>
      </div>
    </div>
  );
}
