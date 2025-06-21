/**
 * ClientModal component for Client Tracker (Client Component).
 * Manages client addition/editing with encrypted data, only email required.
 * Why: Flexible UI for freelancers, robust error handling, accessible.
 * How: Logs API payloads, handles encrypt errors, uses Zustand.
 * Changes:
 * - Fixed TypeScript errors for pitchDecks, strategies, decrypted_data.
 * - Used encrypted instead of encryptedData.
 * - Checked onClose type to prevent crash.
 * - Added fallback for empty dropdowns.
 * - Kept userKey in body for api/clients.
 */
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { encrypt } from "@/lib/crypto";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore, useDataStore } from "@/lib/store";
import { Client, PitchDeck, Strategy } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ClientModalProps {
  editClient?: Client | null;
  onClose?: () => void; // Optional to prevent crash
  onSubmit?: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  editClient,
  onClose,
  onSubmit,
}) => {
  const { isSignedIn, user } = useUser();
  const { userKey, error: storeError } = useUIStore();
  const { pitchDecks, strategies, hasDataFetched } = useDataStore();
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    priority: "none",
    status: "none",
    pitch_deck_id: "none",
    strategy_id: "none",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("ClientModal rendering:", {
    isSignedIn,
    userId: user?.id,
    userKey: userKey ? userKey.slice(0, 4) + "..." : "None",
    pitchDecksCount: pitchDecks ? pitchDecks.length : 0,
    strategiesCount: strategies ? strategies.length : 0,
    hasDataFetched,
    editClient: editClient?.id,
    isOpen,
    hasOnClose: !!onClose,
  });

  useEffect(() => {
    console.log("ClientModal useEffect: Checking editClient", {
      editClient: editClient?.id,
      hasDecryptedData: !!editClient?.decrypted_data,
    });
    if (
      editClient &&
      editClient.decrypted_data &&
      !("error" in editClient.decrypted_data)
    ) {
      setFormData({
        first_name: editClient.decrypted_data.first_name || "",
        last_name: editClient.decrypted_data.last_name || "",
        email: editClient.decrypted_data.email || "",
        phone: editClient.decrypted_data.phone || "",
        company: editClient.decrypted_data.company || "",
        priority: editClient.decrypted_data.priority || "none",
        status: editClient.decrypted_data.status || "none",
        pitch_deck_id: editClient.decrypted_data.pitch_deck_id || "none",
        strategy_id: editClient.decrypted_data.strategy_id || "none",
        notes: editClient.decrypted_data.notes || "",
      });
    }
  }, [editClient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleClose = () => {
    console.log("ClientModal: Closing modal");
    setIsOpen(false);
    if (typeof onClose === "function") {
      onClose();
    } else {
      console.warn("ClientModal: onClose is not a function");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user?.id) {
      setError("Please sign in");
      return;
    }
    if (!userKey) {
      setError("Encryption key required");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataToEncrypt = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        priority: formData.priority !== "none" ? formData.priority : null,
        status: formData.status !== "none" ? formData.status : null,
        pitch_deck_id:
          formData.pitch_deck_id !== "none" ? formData.pitch_deck_id : null,
        strategy_id:
          formData.strategy_id !== "none" ? formData.strategy_id : null,
        notes: formData.notes || null,
      };
      const { encrypted, iv, salt } = await encrypt(
        JSON.stringify(dataToEncrypt),
        userKey
      );
      const payload = {
        id: editClient?.id || null,
        encrypted_data: encrypted,
        iv,
        salt,
        userKey,
      };
      console.log("ClientModal: Sending to /api/clients:", payload);
      const res = await fetch("/api/clients", {
        method: editClient ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("ClientModal: Response:", result);
      if (!res.ok) {
        throw new Error(result.error || "Failed to save client");
      }
      useDataStore.getState().setHasFetched(false);
      if (typeof onSubmit === "function") {
        onSubmit();
      }
      handleClose();
    } catch (err) {
      setError((err as Error).message || "Failed to save client");
      console.error("ClientModal submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editClient ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>
            {editClient
              ? "Update client details."
              : "Add a new client. Email is required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              name="priority"
              value={formData.priority}
              onValueChange={handleSelectChange("priority")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={handleSelectChange("status")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pitch_deck_id">Pitch Deck</Label>
            <Select
              name="pitch_deck_id"
              value={formData.pitch_deck_id}
              onValueChange={handleSelectChange("pitch_deck_id")}
              disabled={loading || !hasDataFetched}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pitch deck" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {!hasDataFetched ? (
                  <SelectItem value="loading" disabled>
                    Loading pitch decks...
                  </SelectItem>
                ) : !pitchDecks || pitchDecks.length === 0 ? (
                  <SelectItem value="no-decks" disabled>
                    No pitch decks available
                  </SelectItem>
                ) : (
                  pitchDecks.map((deck: PitchDeck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.decrypted_data && "title" in deck.decrypted_data
                        ? deck.decrypted_data.title
                        : "Unnamed"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="strategy_id">Strategy</Label>
            <Select
              name="strategy_id"
              value={formData.strategy_id}
              onValueChange={handleSelectChange("strategy_id")}
              disabled={loading || !hasDataFetched}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {!hasDataFetched ? (
                  <SelectItem value="loading" disabled>
                    Loading strategies...
                  </SelectItem>
                ) : !strategies || strategies.length === 0 ? (
                  <SelectItem value="no-strategies" disabled>
                    No strategies available
                  </SelectItem>
                ) : (
                  strategies.map((strategy: Strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.decrypted_data &&
                      "name" in strategy.decrypted_data
                        ? strategy.decrypted_data.name
                        : "Unnamed"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {(error || storeError) && (
            <p className="text-red-500">{error || storeError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
  );
};

export default ClientModal;
