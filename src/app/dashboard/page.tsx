"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Client Tracker</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Home
          </Link>
          <Link
            href="/dashboard/analytics"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/pitch-decks"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Pitch Decks
          </Link>
          <Link
            href="/dashboard/strategies"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Strategies
          </Link>
          <Link
            href="/dashboard/journal"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Journal
          </Link>
          <Link
            href="/dashboard/badges"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Badges
          </Link>
          <Link
            href="/dashboard/feedback"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Feedback
          </Link>
          <Link
            href="/dashboard/settings"
            className="block p-2 hover:bg-gray-700 rounded"
          >
            Settings
          </Link>
          <div className="mt-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Hi, {user?.firstName || "User"}!</h1>
        <p className="mt-4 text-lg">
          Welcome to your Client Tracker dashboard.
        </p>
      </main>
    </div>
  );
}
