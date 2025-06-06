"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";
import { encrypt, decrypt } from "@/lib/crypto";
import { useKey } from "@/components/KeyContext";
import { Client, PitchDeck, Strategy } from "@/lib/types";

interface ClientModalProps {
  editClient: Client | null;
  onClose: () => void;
  onSubmit: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  editClient,
  onClose,
  onSubmit,
}) => {
  const { userKey } = useKey();
  const [firstName, setFirstName] = useState(
    editClient?.decrypted_data?.first_name || ""
  );
  const [lastName, setLastName] = useState(
    editClient?.decrypted_data?.last_name || ""
  );
  const [email, setEmail] = useState(editClient?.decrypted_data?.email || "");
  const [priority, setPriority] = useState(
    editClient?.decrypted_data?.priority || "Low"
  );
  const [status, setStatus] = useState(
    editClient?.decrypted_data?.status || "New"
  );
  const [pitchDeckId, setPitchDeckId] = useState(
    editClient?.decrypted_data?.pitch_deck_id || ""
  );
  const [strategyId, setStrategyId] = useState(
    editClient?.decrypted_data?.strategy_id || ""
  );
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    if (!userKey) return;
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const [pitchRes, stratRes] = await Promise.all([
          fetch("/api/pitch-decks"),
          fetch("/api/strategies"),
        ]);
        const [pitchData, stratData] = await Promise.all([
          pitchRes.json(),
          stratRes.json(),
        ]);
        if (!pitchRes.ok)
          throw new Error(pitchData.error || "Failed to fetch pitch decks");
        if (!stratRes.ok)
          throw new Error(stratData.error || "Failed to fetch strategies");
        console.log("Fetched pitch decks:", pitchData.data);
        console.log("Fetched strategies:", stratData.data);
        const decryptedPitchDecks = await Promise.all(
          pitchData.data.map(async (deck: PitchDeck) => {
            try {
              const decrypted = await decrypt(
                deck.encrypted_data,
                userKey,
                deck.iv
              );
              return { ...deck, decrypted_data: JSON.parse(decrypted) };
            } catch (err) {
              console.error(`Pitch deck ${deck.id} decryption failed:`, err);
              return null;
            }
          })
        );
        const decryptedStrategies = await Promise.all(
          stratData.data.map(async (strat: Strategy) => {
            try {
              const decrypted = await decrypt(
                strat.encrypted_data,
                userKey,
                strat.iv
              );
              return { ...strat, decrypted_data: JSON.parse(decrypted) };
            } catch (err) {
              console.error(`Strategy ${strat.id} decryption failed:`, err);
              return null;
            }
          })
        );
        const validPitchDecks = decryptedPitchDecks.filter(
          (deck): deck is PitchDeck => deck !== null
        );
        const validStrategies = decryptedStrategies.filter(
          (strat): strat is Strategy => strat !== null
        );
        console.log("Valid pitch decks:", validPitchDecks);
        console.log("Valid strategies:", validStrategies);
        setPitchDecks(validPitchDecks);
        setStrategies(validStrategies);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, [userKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userKey) {
      setError("Encryption key required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        priority,
        status,
        pitch_deck_id: pitchDeckId || undefined,
        strategy_id: strategyId || undefined,
      });
      const { encrypted, salt, iv } = await encrypt(data, userKey);
      const endpoint = "/api/clients";
      const method = editClient ? "PUT" : "POST";
      const body = editClient
        ? { id: editClient.id, encrypted_data: encrypted, salt, iv, userKey }
        : { encrypted_data: encrypted, salt, iv, userKey };
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Operation failed");
      onSubmit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card ref={modalRef} className="w-96">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{editClient ? "Edit Client" : "Add Client"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border-input p-2 rounded focus:ring-2 w-full"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border-input p-2 rounded focus:ring-2 w-full"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              value={pitchDeckId}
              onChange={(e) => setPitchDeckId(e.target.value)}
              className="border-input p-2 rounded focus:ring-2 w-full"
            >
              <option value="">Select Pitch Deck</option>
              {pitchDecks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.decrypted_data?.name || "Unknown"}
                </option>
              ))}
            </select>
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="border-input p-2 rounded focus:ring-2 w-full"
            >
              <option value="">Select Strategy</option>
              {strategies.map((strat) => (
                <option key={strat.id} value={strat.id}>
                  {strat.decrypted_data?.title || "Unknown"}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              disabled={loading || !userKey}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editClient ? "Update Client" : "Add Client"}
            </Button>
            {error && <p className="text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientModal;
