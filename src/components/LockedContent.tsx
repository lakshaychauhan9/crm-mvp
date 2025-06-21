/**
 * LockedContent component for Client Tracker (Client Component).
 * Conditionally renders children based on userKey and route.
 * Why: Simplifies content locking logic, deferring key input to KeyPromptModal.
 * How: Uses Zustand to check userKey, renders children if unlocked or for non-protected routes.
 * Changes:
 * - Removed fixed header bar (handled by KeyPromptModal).
 * - Simplified to pass through children if userKey exists or route is non-protected.
 * - Added route-based logic to allow non-protected routes (e.g., /dashboard/settings).
 */
"use client";

import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";

export default function LockedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userKey } = useUIStore();
  const pathname = usePathname();

  // Non-protected routes that don't require userKey
  const nonProtectedRoutes = [
    "/dashboard/settings",
    "/dashboard/feedback",
    "/dashboard/badges",
    "/dashboard/journal",
  ];

  const isNonProtected = nonProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  console.log("LockedContent:", {
    pathname,
    hasUserKey: !!userKey,
    isNonProtected,
  });

  // Render children if userKey exists or route is non-protected
  if (userKey || isNonProtected) {
    return <div className="w-full">{children}</div>;
  }

  // Return null to defer rendering to KeyPromptModal
  return null;
}
