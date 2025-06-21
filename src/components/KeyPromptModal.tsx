/**
 * KeyPromptModal component for Client Tracker (Client Component).
 * Prompts user for encryption key on app load.
 * Why: Ensures userKey is set for encryption/decryption.
 * How: Uses Zustand for state, Shadcn for UI.
 * Changes:
 * - Added validation to prevent empty key.
 * - Improved logging to debug double prompts.
 * - Ensured single submission.
 */
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUIStore } from "@/lib/store";

export default function KeyPromptModal() {
  const { userKey, setUserKey, setError } = useUIStore();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  console.log("KeyPromptModal rendering:", {
    hasUserKey: !!userKey,
    keyLength: key.length,
    loading,
    localError,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setLocalError("Encryption key is required");
      return;
    }
    setLoading(true);
    setLocalError(null);
    try {
      console.log("KeyPromptModal: Submitting key:", key.slice(0, 4) + "...");
      setUserKey(key);
    } catch (err) {
      const errMsg = (err as Error).message || "Failed to set key";
      setLocalError(errMsg);
      setError(errMsg);
      console.error("KeyPromptModal error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (userKey) {
    console.log("KeyPromptModal: Hidden (userKey set)");
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Encryption Key</DialogTitle>
          <DialogDescription>
            Provide your encryption key to access your data securely.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="key">Encryption Key</Label>
            <Input
              id="key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {localError && <p className="text-red-500">{localError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
