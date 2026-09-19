import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Stores & Brands | DealPilot",
  description:
    "Browse stores and brands on DealPilot to find coupons, promo codes, deals, and discounts.",
  alternates: {
    canonical: `${siteUrl}/stores`,
  },
  openGraph: {
    title: "Stores & Brands | DealPilot",
    description:
      "Browse stores and brands on DealPilot to find coupons, promo codes, deals, and discounts.",
    url: `${siteUrl}/stores`,
    siteName: "DealPilot",
    type: "website",
  },
};

export default function StoresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
