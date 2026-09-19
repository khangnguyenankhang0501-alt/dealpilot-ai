import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Shop by Category | DealPilot",
  description:
    "Browse coupons, deals, discounts, and promo codes by category on DealPilot.",
  alternates: {
    canonical: `${siteUrl}/categories`,
  },
  openGraph: {
    title: "Shop by Category | DealPilot",
    description:
      "Browse coupons, deals, discounts, and promo codes by category on DealPilot.",
    url: `${siteUrl}/categories`,
    siteName: "DealPilot",
    type: "website",
  },
};

export default function CategoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
