import FeaturedCoupons from "@/components/FeaturedCoupons";
import PopularCoupons from "@/components/PopularCoupons";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

// 1. Thêm Metadata cho Trang Chủ (Static Page)
export const metadata: Metadata = {
  title: "DealPilot - Best Coupon Codes, Promo Codes & Discounts August 2026",
  description:
    "Find and save with the latest verified promo codes, discount coupons, and deals for thousands of online stores. Updated daily.",
};

// 2. Tắt cache để luôn lấy dữ liệu mới nhất từ Supabase
export const revalidate = 0;

export default async function HomePage() {
  const { data: coupons } = await supabase.from("coupons").select("*");

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Hiển thị mục Featured Coupons */}
      <FeaturedCoupons />

      {/* Hiển thị mục Popular Coupons (Top 6 coupon hot nhất) */}
      <PopularCoupons />

      <h1 className="text-4xl font-bold mb-8 mt-12">Latest Coupons</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <Link href={`/coupons/${coupon.slug}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition">
                  {coupon.title}
                </h2>
              </Link>

              <p className="text-gray-500 mb-3">
                <Link
                  href={`/stores/${coupon.store_name?.toLowerCase()}`}
                  className="text-blue-600 hover:underline"
                >
                  {coupon.store_name}
                </Link>
              </p>

              <div className="mt-3 inline-flex items-center overflow-hidden rounded-lg border border-green-200">
                <div className="bg-green-50 px-4 py-2 font-bold text-green-700">
                  {coupon.coupon_code?.slice(0, 4)}**
                </div>
                <Link
                  href={`/coupons/${coupon.slug}`}
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition font-medium"
                >
                  Get Code
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Expires: {coupon.expires_at}
              </p>
            </div>

            <div className="mt-4">
              <Link
                href={`/coupons/${coupon.slug}`}
                className="block bg-gray-100 text-black text-center py-2 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                View Coupon
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
