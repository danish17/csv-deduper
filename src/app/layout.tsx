import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSV Deduper & Row Expander",
  description:
    "Next.js app for row expansion with deduplication while aggregating associated metrics for each unique value.",
  openGraph: {
    title: "CSV Deduper & Row Expander",
    description:
      "Next.js app for row expansion with deduplication while aggregating associated metrics for each unique value.",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg", // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "CSV Deduper & Row Expander",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV Deduper & Row Expander",
    description:
      "Next.js app for row expansion with deduplication while aggregating associated metrics for each unique value.",
    images: ["/og-image.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
