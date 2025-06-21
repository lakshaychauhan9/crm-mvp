/**
 * Root layout for Client Tracker (Server Component).
 * Wraps app with ClerkProvider for authentication and global styles.
 * Why: Ensures auth context, sets up public routes, and applies base layout.
 * How: Uses ClerkProvider, sets metadata, and renders children.
 * Note: ClientRoot handles dashboard-specific logic.
 */
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import AnimatedWrapper from "./AnimatedWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Client Tracker",
  description: "Secure CRM for freelancers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-background`}>
          <AnimatedWrapper>{children}</AnimatedWrapper>{" "}
        </body>
      </html>
    </ClerkProvider>
  );
}
