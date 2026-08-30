import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
