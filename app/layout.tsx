import type { Metadata, Viewport } from "next";
import "./globals.css";

import Header from "@/components/Header";
import { GoogleAnalytics } from "@next/third-parties/google";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dealpilot-ai-iota.vercel.app";

const GOOGLE_VERIFICATION_CODE = "Mx8Le7PD8lABdaKRcpNr55g0Ncs7XjqZ6bfsOpCgmk";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "DealPilot - Best Coupon Codes & Deals",
    template: "%s | DealPilot",
  },

  description:
    "Find the best coupon codes, promo codes, discounts, and daily deals on DealPilot.",

  verification: {
    google: GOOGLE_VERIFICATION_CODE,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DealPilot",

    title: "DealPilot - Best Coupon Codes & Deals",

    description:
      "Find coupon codes, promo codes, discounts, and daily deals on DealPilot.",

    url: SITE_URL,
  },

  twitter: {
    card: "summary_large_image",

    title: "DealPilot - Best Coupon Codes & Deals",

    description:
      "Find coupon codes, promo codes, discounts, and daily deals on DealPilot.",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body>
        <Header />

        {children}

        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
