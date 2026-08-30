import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

// Đoạn mã bí mật xác thực từ ảnh lỗi của bạn:
const GOOGLE_VERIFICATION_CODE = "Mx8Le7PD8labDAkRCpsNr5Sg0Ncs7xjqz6bfs0pCgmk";

export const metadata: Metadata = {
  title: "DealPilot - Best Coupon Codes & Deals",
  description: "Find the best coupon codes, promo codes, and daily deals.",
  verification: {
    google: GOOGLE_VERIFICATION_CODE,
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
        {/* Thanh Header chính của trang */}
        <Header />

        {/* Nội dung các trang con */}
        {children}
      </body>
    </html>
  );
}
