// Clerk middleware to protect routes and allow public access to specific paths.
// Redirects unauthenticated users to sign-up for protected routes.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/clerk-webhook",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log("Middleware executed:", {
    url: req.url.toString(),
    method: req.method,
    userId: userId || "unauthenticated",
  });

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    console.log("Middleware: Redirecting unauthenticated user to /sign-up");
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
