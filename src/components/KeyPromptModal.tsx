import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface KeyPromptModalProps {
  onKeySet: (key: string) => void;
}

const KeyPromptModal: React.FC<KeyPromptModalProps> = ({ onKeySet }) => {
  const { user, isSignedIn } = useUser();
  const [encryptionKey, setEncryptionKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyExists, setKeyExists] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const checkKey = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user-keys", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const { keyExists } = await res.json();
        setKeyExists(keyExists);
      } catch (err) {
        setError(`Failed to check key status : ${err}`);
      } finally {
        setLoading(false);
      }
    };
    checkKey();
  }, [isSignedIn, user]);

  const handleSubmit = async () => {
    if (!encryptionKey) {
      setError("Please enter an encryption key");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey: encryptionKey, verifyOnly: keyExists }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to process key");
      if (result.success && result.keyValid) {
        onKeySet(encryptionKey);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-2xl">
            {keyExists ? "Enter Encryption Key" : "Set Encryption Key"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your encryption key"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="border-input focus:ring-2"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Processing..." : keyExists ? "Verify Key" : "Set Key"}
            </Button>
            {error && <p className="text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyPromptModal;
