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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tenkai Marketing',
  applicationCategory: 'BusinessApplication',
  description: 'AI-powered SEO agency platform. Automated audits, content, and link building — working 24/7.',
  url: 'https://tenkai-marketing.vercel.app',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '150',
    highPrice: '500',
    offerCount: '3',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Alegius AI',
    url: 'https://tenkai-marketing.vercel.app',
  },
}

export const metadata: Metadata = {
  title: "Tenkai — AI SEO Agency | Automated SEO for Small Business",
  description: "Your dedicated team of AI SEO agents. Audits, content, and link building — working 24/7 from $150/mo.",
  alternates: {
    canonical: 'https://tenkai-marketing.vercel.app',
  },
  openGraph: {
    title: "Tenkai — AI SEO Agency | Automated SEO for Small Business",
    description: "Your dedicated team of AI SEO agents. Audits, content, and link building — working 24/7 from $150/mo.",
    siteName: "Tenkai",
    type: "website",
    url: 'https://tenkai-marketing.vercel.app',
    images: [{ url: 'https://tenkai-marketing.vercel.app/og-image.png', width: 1200, height: 630, alt: 'Tenkai Marketing — AI-Powered SEO' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tenkai — AI SEO Agency | Automated SEO for Small Business",
    description: "Your dedicated team of AI SEO agents. Audits, content, and link building — working 24/7 from $150/mo.",
    images: ['https://tenkai-marketing.vercel.app/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
