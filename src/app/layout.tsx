import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tenkai — AI-Powered Digital Marketing",
  description: "Your dedicated team of AI marketing agents. SEO, content, social media — working 24/7.",
  openGraph: {
    title: "Tenkai — AI-Powered Digital Marketing",
    description: "Your dedicated team of AI marketing agents. SEO, content, social media — working 24/7.",
    siteName: "Tenkai",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tenkai — AI-Powered Digital Marketing",
    description: "Your dedicated team of AI marketing agents. SEO, content, social media — working 24/7.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
