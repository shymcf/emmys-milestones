import type { Metadata } from "next";

import { Caveat, Quicksand } from "next/font/google";

import { Providers } from "./providers";

import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Totter",
  description:
    "Track your child's developmental milestones with warmth and confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${caveat.variable} ${quicksand.variable}`}>
      <body>
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
