"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface KeyContextType {
  userKey: string;
  setUserKey: (key: string) => void;
  clearUserKey: () => void;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSignedIn } = useUser();
  // const { signOut } = useClerk();
  const [userKey, setUserKeyState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedKey = sessionStorage.getItem("userKey");
      console.log("Initial key from sessionStorage:", storedKey);
      return storedKey || "";
    }
    return "";
  });

  const setUserKey = (key: string) => {
    console.log("Setting userKey:", key ? "****" : "empty");
    setUserKeyState(key);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userKey", key);
    }
  };

  const clearUserKey = () => {
    console.log("Clearing userKey");
    setUserKeyState("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userKey");
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      console.log("User signed out, clearing key");
      clearUserKey();
    }
  }, [isSignedIn]);

  useEffect(() => {
    const handleSignOut = () => {
      console.log("Sign-out detected, clearing key");
      clearUserKey();
    };
    window.addEventListener("clerk:signout", handleSignOut);
    return () => window.removeEventListener("clerk:signout", handleSignOut);
  }, []);

  return (
    <KeyContext.Provider value={{ userKey, setUserKey, clearUserKey }}>
      {children}
    </KeyContext.Provider>
  );
};

export const useKey = () => {
  const context = useContext(KeyContext);
  if (!context) throw new Error("useKey must be used within a KeyProvider");
  return context;
};
