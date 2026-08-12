import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import MetaPixel from "@/components/MetaPixel";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://speed.go-techsolution.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Go-Speed | Premium $99 Website SLA Launch",
  description: "Get a high-performance, conversion-optimized Next.js website delivered within 48 hours of our kickoff call for just $99.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      </head>
      <body suppressHydrationWarning>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
