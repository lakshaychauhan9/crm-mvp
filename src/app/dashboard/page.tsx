"use client";

// Dashboard page displaying user information and encryption key management.
// Fetches user data from Supabase, renders blocks for greeting, user info, key form, and sign-out.
import { SignOutButton } from "@/components/sign-out-button";
import { KeyForm } from "@/components/KeyForm";
import { useUser, useSession } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const [userData, setUserData] = useState<{
    username?: string;
    email?: string;
    encryption_key_salt?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch user data from Supabase when user and session are available.
  const fetchUserData = useCallback(async () => {
    if (!isLoaded || !user?.id || !session) {
      setIsLoadingData(false);
      return;
    }

    try {
      const token = await session.getToken();
      if (process.env.NODE_ENV === "development") {
        console.log("Dashboard: Clerk token:", {
          token: token ? "present" : "missing",
        });
      }
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const supabase = getSupabaseBrowserClient(token);
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, username, encryption_key_salt, encryption_test_iv, encrypted_test_data"
        )
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("Dashboard: Supabase error:", error);
        setError("Unable to load your profile. Please try again later.");
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Dashboard: User data:", data);
      }
      setUserData(data);
    } catch (err) {
      console.error("Dashboard: Fetch error:", err);
      setError("An error occurred while loading your profile.");
    } finally {
      setIsLoadingData(false);
    }
  }, [isLoaded, user?.id, session]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (!isLoaded || isLoadingData) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="p-4 text-center">
        Please sign in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Greeting Block */}
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <h1 className="text-2xl font-bold">
          Welcome, {userData?.username || user.firstName || "User"}!
        </h1>
      </div>

      {/* User Info Block */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="mb-2">
          Email: {userData?.email || user.primaryEmailAddress?.emailAddress}
        </p>
        <p>
          Encryption Key: {userData?.encryption_key_salt ? "Set" : "Not set"}
        </p>
      </div>

      {/* Error Block */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Key Setup/Validation Block */}
      <KeyForm userId={user.id} hasKey={!!userData?.encryption_key_salt} />

      {/* Sign Out Block */}
      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
