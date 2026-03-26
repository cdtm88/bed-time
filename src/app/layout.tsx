import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Nightlight Tales",
  description: "Personalized bedtime stories for children",
  openGraph: {
    title: "Nightlight Tales",
    description: "Personalized bedtime stories for children",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-surface text-on-surface">{children}</body>
    </html>
  );
}
