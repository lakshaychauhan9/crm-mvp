"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { decrypt } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Edit2, X } from "lucide-react";
import LockedContent from "@/components/LockedContent";
import Header from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useKey } from "@/components/KeyContext";
import { Strategy } from "@/lib/types";

const StrategyManager: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const { userKey } = useKey();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    if (!userKey || !isSignedIn || !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategies", {
        headers: { "Content-Type": "application/json" },
      });
      const { data } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch strategies");
      const decryptedStrategies = await Promise.all(
        data.map(async (strat: Strategy) => {
          try {
            const decrypted = await decrypt(
              strat.encrypted_data,
              userKey,
              strat.iv
            );
            return { ...strat, decrypted_data: JSON.parse(decrypted) };
          } catch (err) {
            console.error(`Decryption failed for strategy ${strat.id}:`, err);
            return { ...strat, decrypted_data: { error: "Decryption failed" } };
          }
        })
      );
      setStrategies(decryptedStrategies);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userKey, isSignedIn, user]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !userKey) {
      setError("Please provide a title and encryption key");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = editId
        ? { id: editId, title, steps: steps.filter((s) => s), userKey }
        : { title, steps: steps.filter((s) => s), userKey };
      const method = editId ? "PUT" : "POST";
      const res = await fetch("/api/strategies", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Operation failed");
      setTitle("");
      setSteps([""]);
      setEditId(null);
      await fetchStrategies();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (strat: Strategy) => {
    if (strat.decrypted_data && "error" in strat.decrypted_data) {
      setError("Cannot edit: Decryption failed");
      return;
    }
    setEditId(strat.id);
    setTitle(strat.decrypted_data?.title || "");
    setSteps(strat.decrypted_data?.steps || [""]);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");
      await fetchStrategies();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return <div>Please sign in to view strategies</div>;

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
                  {editId ? "Edit Strategy" : "Add Strategy"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Strategy Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  {steps.map((step, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
                      />
                      {steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddStep}
                    className="w-full"
                  >
                    Add Step
                  </Button>
                  <Button type="submit" disabled={loading || !userKey}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editId ? "Update Strategy" : "Add Strategy"}
                  </Button>
                  {error && <p className="text-destructive">{error}</p>}
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                )}
                {strategies.length === 0 && !loading && (
                  <p>No strategies found</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategies.map((strat) => (
                    <Card key={strat.id} className="w-full max-w-sm">
                      <CardContent className="p-4">
                        {"error" in (strat.decrypted_data || {}) ? (
                          <span className="text-destructive">
                            Decryption failed
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {strat.decrypted_data?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Steps: {strat.decrypted_data?.steps?.length || 0}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(strat)}
                                disabled={loading}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(strat.id)}
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

export default StrategyManager;
