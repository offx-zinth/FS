import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Just_Another_Hand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const justAnotherHand = Just_Another_Hand({
  variable: "--font-just-another-hand",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "FlowDesk - Calm Focus Workspace",
  description: "A minimal, calm digital study space for focused productivity.",
  keywords: ["focus", "productivity", "pomodoro", "study", "calm", "minimal"],
  authors: [{ name: "FlowDesk" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${justAnotherHand.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
