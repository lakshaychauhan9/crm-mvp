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
  const [userKey, setUserKeyState] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("userKey") || "";
    }
    return "";
  });

  const setUserKey = (key: string) => {
    setUserKeyState(key);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userKey", key);
    }
  };

  const clearUserKey = () => {
    setUserKeyState("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userKey");
    }
  };

  useEffect(() => {
    if (!isSignedIn) clearUserKey();
  }, [isSignedIn]);

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
