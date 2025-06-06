import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useKey } from "@/components/KeyContext";

interface LockedContentProps {
  children: React.ReactNode;
}

const LockedContent: React.FC<LockedContentProps> = ({ children }) => {
  const { userKey, setUserKey } = useKey();
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!keyInput) {
      setError("Please enter an encryption key");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey: keyInput, verifyOnly: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to verify key");
      if (result.success && result.keyValid) {
        setUserKey(keyInput);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (userKey) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Unlock Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter encryption key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <Button
                onClick={handleUnlock}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Verifying..." : "Unlock"}
              </Button>
              {error && <p className="text-destructive">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="pointer-events-none opacity-50">{children}</div>
    </div>
  );
};

export default LockedContent;
