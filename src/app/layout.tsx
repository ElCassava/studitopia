import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/common/AuthContext";

export const metadata: Metadata = {
  title: "Studitopia - Personalized Learning",
  description: "Learning feels better when it's made for you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
