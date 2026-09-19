import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Best Deals & Discounts | DealPilot",
  description:
    "Discover the latest deals, discounts, price drops, and savings from popular stores on DealPilot.",
  alternates: {
    canonical: `${siteUrl}/deals`,
  },
  openGraph: {
    title: "Best Deals & Discounts | DealPilot",
    description:
      "Discover the latest deals, discounts, price drops, and savings from popular stores on DealPilot.",
    url: `${siteUrl}/deals`,
    siteName: "DealPilot",
    type: "website",
  },
};

export default function DealsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
