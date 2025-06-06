import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { KeyProvider } from "@/components/KeyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Client Tracker",
  description: "Secure CRM for small businesses and freelancers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <KeyProvider>{children}</KeyProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
