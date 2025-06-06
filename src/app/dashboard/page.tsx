"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { encrypt, decrypt } from "@/lib/crypto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  encrypted_data: string;
  salt: string;
  iv: string;
  created_at: string;
  updated_at: string;
  decrypted_data?:
    | {
        first_name: string;
        last_name: string;
        email: string;
      }
    | { error: string };
}

export default function Dashboard() {
  const { isSignedIn } = useUser();
  const [userKey, setUserKey] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!userKey) {
      console.log("No user key provided, skipping fetch");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Fetch clients response status:", res.status);
      const { data } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch clients");
      const decryptedClients = data.map((client: Client) => {
        try {
          const decrypted = decrypt(client.encrypted_data, userKey, client.iv);
          console.log(`Decrypted client ${client.id}:`, decrypted);
          return { ...client, decrypted_data: JSON.parse(decrypted) };
        } catch (err) {
          console.error(`Decryption failed for client ${client.id}:`, err);
          return { ...client, decrypted_data: { error: "Decryption failed" } };
        }
      });
      setClients(decryptedClients);
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error("Fetch clients error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    if (isSignedIn) fetchClients();
  }, [isSignedIn, fetchClients]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userKey) {
        setError("Please enter your encryption key");
        console.log("Submit failed: No user key");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        });
        console.log("Encrypting data:", data);
        const { encrypted, salt, iv } = encrypt(data, userKey);
        const endpoint = editId ? "/api/clients" : "/api/clients";
        const method = editId ? "PUT" : "POST";
        const body = editId
          ? { id: editId, encrypted_data: encrypted, salt, iv, userKey }
          : { encrypted_data: encrypted, salt, iv, userKey };
        console.log(`Submitting ${method} to ${endpoint}:`, body);
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();
        console.log(`Submit ${method} response:`, result);
        if (!res.ok) throw new Error(result.error || "Operation failed");
        setFirstName("");
        setLastName("");
        setEmail("");
        setEditId(null);
        await fetchClients();
      } catch (err) {
        const errorMessage = (err as Error).message;
        console.error(`Submit ${editId ? "PUT" : "POST"} error:`, errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [firstName, lastName, email, editId, userKey, fetchClients]
  );

  const handleEdit = useCallback((client: Client) => {
    if (client.decrypted_data && "error" in client.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      console.log(`Edit failed for client ${client.id}: Decryption error`);
      return;
    }
    setEditId(client.id);
    setFirstName(client.decrypted_data?.first_name || "");
    setLastName(client.decrypted_data?.last_name || "");
    setEmail(client.decrypted_data?.email || "");
    console.log(`Editing client ${client.id}`);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Deleting client ${id}`);
        const res = await fetch("/api/clients", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const result = await res.json();
        console.log("Delete response:", result);
        if (!res.ok) throw new Error(result.error || "Delete failed");
        await fetchClients();
      } catch (err) {
        const errorMessage = (err as Error).message;
        console.error(`Delete error for client ${id}:`, errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchClients]
  );

  if (!isSignedIn) return <div>Please sign in to view the dashboard</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground p-4">
        <h2 className="text-xl font-bold mb-4">Client Tracker</h2>
        <nav className="space-y-2">
          <Link
            href="/"
            className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="block bg-accent text-accent-foreground p-2 rounded"
          >
            Dashboard
          </Link>
          <SignOutButton>
            <button className="w-full text-left hover:bg-accent hover:text-accent-foreground p-2 rounded">
              Sign Out
            </button>
          </SignOutButton>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editId ? "Edit Client" : "Add Client"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter encryption key"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                required
              />
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editId ? "Update Client" : "Add Client"}
              </Button>
            </form>
            {error && <p className="text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
            {clients.length === 0 && !loading && <p>No clients found</p>}
            <ul className="space-y-2">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    {"error" in (client.decrypted_data || {}) ? (
                      <span className="text-destructive">
                        Decryption failed
                      </span>
                    ) : (
                      <>
                        <span>
                          {client.decrypted_data?.first_name}{" "}
                          {client.decrypted_data?.last_name}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {client.decrypted_data?.email}
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(client)}
                      disabled={loading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
