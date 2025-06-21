// src/lib/clerk-utils.ts (Replace your existing content with this)
import { IncomingMessage } from "http";

// Define RequestLike type to satisfy Clerk's getAuth parameter
// This structure explicitly includes the 'cookies' property that getAuth expects.
export type ClerkRequestLike = IncomingMessage & {
  cookies: Partial<Record<string, string>>;
  // Other properties like headers and url might be implicitly required depending on Clerk's version
  // but cookies is the most commonly missing one causing type errors.
};

// This utility function converts an IncomingMessage (from getServerSideProps context.req)
// into a ClerkRequestLike object that Clerk's getAuth can process.
export function toRequestLike(req: IncomingMessage): ClerkRequestLike {
  // We are asserting that the IncomingMessage from Next.js's getServerSideProps
  // will have a 'cookies' property populated by Next.js itself.
  // This is usually true for req in getServerSideProps contexts.
  return req as ClerkRequestLike;
}
