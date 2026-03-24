import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nightlight Tales",
  description: "Personalized bedtime stories for children",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
