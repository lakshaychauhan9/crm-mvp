import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
// import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  //   const router = useRouter();

  return (
    <aside className="w-64 bg-secondary text-secondary-foreground p-4">
      <h2 className="text-xl font-bold mb-4">Client Tracker</h2>
      <nav className="space-y-2">
        <Link
          href="/"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/pitch-decks"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Pitch Decks
        </Link>
        <Link
          href="/dashboard/strategies"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Strategies
        </Link>
        <Link
          href="/dashboard/journal"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Journal
        </Link>
        <Link
          href="/dashboard/badges"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Badges
        </Link>
        <Link
          href="/dashboard/feedback"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Feedback
        </Link>
        <Link
          href="/dashboard/settings"
          className="block hover:bg-accent hover:text-accent-foreground p-2 rounded"
        >
          Settings
        </Link>
        <SignOutButton>
          <button className="w-full text-left hover:bg-accent hover:text-accent-foreground p-2 rounded">
            Sign Out
          </button>
        </SignOutButton>
      </nav>
    </aside>
  );
};

export default Sidebar;
