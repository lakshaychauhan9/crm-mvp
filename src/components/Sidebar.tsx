"use client";

// import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
// import { useDataStore } from "@/lib/store";

export default function Sidebar() {
  // const { hasDataFetched } = useDataStore();

  // const routes = [
  //   { href: "/dashboard", label: "Home" },
  //   { href: "/clients", label: "Clients" },
  //   { href: "/pitch-decks", label: "Pitch Decks" },
  //   { href: "/strategies", label: "Strategies" },
  //   { href: "/journal", label: "Journal" },
  //   { href: "/analytics", label: "Analytics" },
  // ];

  return (
    <aside className="w-64 bg-white/90 p-4">
      <h2 className="text-xl font-bold mb-4">Client Tracker</h2>
      <nav className="space-y-2">
        <SignOutButton>
          <button className="w-full text-left p-2 rounded hover:bg-gray-200">
            Sign Out
          </button>
        </SignOutButton>
      </nav>
    </aside>
  );
}
