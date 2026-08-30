import { supabase } from "@/lib/supabaseClientClient";
import { Metadata } from "next";
import Link from "next/link";

// Tối ưu SEO cho trang Top Brands
export const metadata: Metadata = {
  title: "Top Brands Coupons & Promo Codes | DealPilot",
  description:
    "Find the best deals and verified promo codes from top brands like Amazon, Walmart, Nike, Adidas, Best Buy, and Target.",
};

export const revalidate = 0;

export default async function TopBrandsPage() {
  // Danh sách các thương hiệu top theo yêu cầu
  const topBrandNames = [
    "Amazon",
    "Walmart",
    "Nike",
    "Adidas",
    "Best Buy",
    "Target",
  ];

  // Fetch dữ liệu các cửa hàng này từ database
  const { data: topBrands } = await supabase
    .from("stores")
    .select("*")
    .in("name", topBrandNames);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">Top Brands</h1>
      <p className="text-gray-600 mb-10 text-lg">
        Save big with the latest coupon codes and discounts from our most
        popular stores.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {topBrands?.map((brand) => (
          <Link
            key={brand.id}
            href={`/stores/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg transition bg-white"
          >
            {/* Nếu có logo, hiển thị logo ở đây. Tạm thời dùng Tên */}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-xl font-bold text-gray-700">
              {brand.name.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold hover:text-blue-600">
              {brand.name}
            </h2>
            <p className="text-sm text-green-600 mt-2 font-medium">
              View Deals &rarr;
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
