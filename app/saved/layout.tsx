import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Saved Coupons | DealPilot",
  description: "View your saved coupons and deals on DealPilot.",
  alternates: {
    canonical: `${siteUrl}/saved`,
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Saved Coupons | DealPilot",
    description: "View your saved coupons and deals on DealPilot.",
    url: `${siteUrl}/saved`,
    siteName: "DealPilot",
    type: "website",
  },
};

export default function SavedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
