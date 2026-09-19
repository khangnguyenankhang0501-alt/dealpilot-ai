import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Search Coupons & Deals | DealPilot",
  description:
    "Search for coupons, promo codes, deals, discounts, and stores on DealPilot.",
  alternates: {
    canonical: `${siteUrl}/search`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Search Coupons & Deals | DealPilot",
    description:
      "Search for coupons, promo codes, deals, discounts, and stores on DealPilot.",
    url: `${siteUrl}/search`,
    siteName: "DealPilot",
    type: "website",
  },
};

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
