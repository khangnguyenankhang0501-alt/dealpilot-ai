import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { GoogleAnalytics } from "@next/third-parties/google";

const GOOGLE_VERIFICATION_CODE = "Mx8Le7PD8lABdaKRcpNr55g0Ncs7XjqZ6bfsOpCgmk";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "DealPilot - Best Coupon Codes & Deals",
  description: "Find the best coupon codes, promo codes, and daily deals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Thanh Header chính của trang */}
        <Header />

        {/* Nội dung các trang con */}
        {children}

        {/* Google Analytics 4 Tracking */}
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""}
        />
      </body>
    </html>
  );
}
