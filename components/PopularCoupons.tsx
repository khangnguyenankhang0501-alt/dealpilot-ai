import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function PopularCoupons() {
  // 1. Thử lấy danh sách coupons có lượt click cao nhất
  let { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(2);

  // 2. Dự phòng: Nếu chưa có coupon nào có lượt click (hoặc trả về null), lấy 2 coupon bất kỳ để giao diện không bị trống
  if (!coupons || coupons.length === 0) {
    const { data: fallbackCoupons } = await supabase
      .from("coupons")
      .select("*")
      .limit(2);
    coupons = fallbackCoupons;
  }

  // Nếu trong Database hoàn toàn chưa có coupon nào thì tạm thời không hiện
  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🔥 Most Popular Coupons
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-bold mb-1 text-gray-900">
                {coupon.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{coupon.store_name}</p>

              {/* Tag Auto Deal */}
              <div className="mb-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium inline-block">
                  Auto Deal
                </span>
              </div>

              {/* Số lượt click */}
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
                📈 {coupon.clicks || 0}{" "}
                {coupon.clicks === 1 ? "click" : "clicks"}
              </p>
            </div>

            {/* Nút Xem chi tiết */}
            <Link
              href={`/coupons/${coupon.slug}`}
              className="block bg-black text-white text-center py-3 rounded-xl hover:bg-gray-800 transition font-medium"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
