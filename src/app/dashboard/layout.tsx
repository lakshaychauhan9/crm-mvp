// src/app/dashboard/layout.tsx
/**
 * Dashboard layout for Client Tracker (Server Component).
 * Wraps dashboard routes with sidebar and main content.
 * Why: Provides a centered, consistent layout for dashboard pages.
 * How: Uses Clerk for auth, centers sidebar and content, whitish sidebar background.
 * Changes:
 * - Centered layout with flexbox.
 * - Removed full-height sidebar, adjusted to content height.
 * - Set whitish background for sidebar.
 */
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <SignedOut>
        <div className="flex justify-center items-center h-screen">
          Please sign in to access the dashboard.
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex w-full max-w-5xl items-center justify-center  ">
          <Sidebar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </SignedIn>
    </div>
  );
}
