"use client";

// Dashboard page displaying user information and encryption key management.
// Fetches user data from Supabase, renders blocks for greeting, user info, key form, and sign-out.
import { SignOutButton } from "@/components/SignOutButton";
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
        console.log("Dashboard: Clerk user data:", {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
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

  // Callback to refresh user data after key setup.
  const handleKeySet = () => {
    fetchUserData();
  };

  if (!isLoaded) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center text-gray-600">
        Loading...
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center text-red-600">
        Please sign in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      {/* Greeting Block */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h1 className="text-3xl font-bold text-blue-800">
          Welcome, {userData?.username || user.firstName || "User"}!
        </h1>
      </div>

      {/* User Info Block */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="mb-2 text-gray-700">
          <span className="font-semibold">Email:</span>{" "}
          {userData?.email || user.primaryEmailAddress?.emailAddress}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Encryption Key:</span>{" "}
          {userData?.encryption_key_salt ? "Set" : "Not set"}
        </p>
      </div>

      {/* Error Block */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Setup/Validation Block */}
      <KeyForm
        userId={user.id}
        hasKey={!!userData?.encryption_key_salt}
        onKeySet={handleKeySet}
        isLoading={isLoadingData}
      />

      {/* Sign Out Block */}
      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
