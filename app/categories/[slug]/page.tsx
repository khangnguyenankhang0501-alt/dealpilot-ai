import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Bổ sung thêm các category theo plan SEO của bạn
const VALID_CATEGORIES = [
  "fashion",
  "electronics",
  "travel",
  "software",
  "furniture",
  "beauty",
  "household",
];

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Thêm Metadata động cho chuẩn SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.slug?.toLowerCase() || "";

  if (!VALID_CATEGORIES.includes(categorySlug)) {
    return { title: "Category Not Found | DealPilot" };
  }

  const categoryName =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  return {
    title: `Best ${categoryName} Promo Codes, Coupons & Deals | DealPilot`,
    description: `Discover the best working promo codes, discounts, and offers for top ${categoryName} brands. Save big today!`,
  };
}

// 2. Tắt cache để luôn lấy dữ liệu mới nhất
export const revalidate = 0;

export default async function CategoryDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.slug?.toLowerCase() || "";

  // Validate category
  if (!VALID_CATEGORIES.includes(categorySlug)) {
    notFound();
  }

  const categoryName =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  // Lấy dữ liệu coupons (Dùng ilike theo code của bạn)
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .ilike("title", `%${categorySlug}%`);

  // Trích xuất danh sách stores độc nhất (unique)
  const stores = Array.from(
    new Set(coupons?.map((coupon) => coupon.store_name).filter(Boolean)),
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-3">
        {categoryName} Coupons & Deals
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        Discover the best promo codes, discounts, and offers for top{" "}
        {categoryName} brands. Save big today!
      </p>

      {/* SECTION 1: CÁC COUPONS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Top {categoryName} Coupons</h2>
        {coupons && coupons.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="border rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <Link href={`/coupons/${coupon.slug}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition">
                      {coupon.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 mb-4">{coupon.store_name}</p>
                </div>

                <Link
                  href={`/coupons/${coupon.slug}`}
                  className="inline-block bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition text-center"
                >
                  Get Code
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed text-center">
            No coupons available in this category yet.
          </p>
        )}
      </section>

      {/* SECTION 2: CÁC STORES LIÊN QUAN */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Top {categoryName} Stores</h2>
        {stores && stores.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {stores.map((store, index) => (
              <Link
                key={index}
                // Thêm .replace để xử lý URL store nếu tên store có dấu cách (vd: "Best Buy" -> "best-buy")
                href={`/stores/${store?.toLowerCase().replace(/\s+/g, "-")}`}
                className="border px-5 py-3 rounded-xl font-medium shadow-sm hover:border-blue-500 hover:text-blue-600 transition bg-white"
              >
                {store}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No stores available in this category yet.
          </p>
        )}
      </section>
    </main>
  );
}
