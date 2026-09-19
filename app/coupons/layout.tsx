import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const pageTitle = "Coupons & Promo Codes | DealPilot";

const pageDescription =
  "Browse active coupon codes, promo codes, discounts and deals from top stores on DealPilot.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${siteUrl}/coupons`,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteUrl}/coupons`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function CouponsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
