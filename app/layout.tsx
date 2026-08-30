import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "DealPilot - Best Coupon Codes & Deals",
  description: "Find the best coupon codes, promo codes, and daily deals.",
  verification: {
    google: "<meta name="google-site-verification" content="Mx8Le7PD8labDAkRCpsNr5Sg0Ncs7xjqz6bfsOpCgmk" />",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Thanh Header chính của trang (đã tích hợp sẵn 2 tầng menu chuẩn) */}
        <Header />

        {/* Nội dung các trang con */}
        {children}
      </body>
    </html>
  );
}
