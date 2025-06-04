import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Client Tracker</h1>
      <p className="mt-4 text-lg">
        A web app for freelancers, students, and marketers to track leads and
        outreach.
      </p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/sign-up"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign Up
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
