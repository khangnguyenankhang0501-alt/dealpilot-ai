import { supabase } from "@/lib/supabaseClientClient";
import GetDealButton from "@/components/GetDealButton";

export const revalidate = 0;

export default async function PromoCodesPage() {
  // 1. Fetch dữ liệu an toàn từ Server
  const { data: couponsData } = await supabase
    .from("coupons")
    .select("*")
    .not("coupon_code", "is", null) // <-- Đã sửa thành coupon_code
    .order("created_at", { ascending: false });

  let coupons: any[] = [];

  if (couponsData) {
    // 2. Đếm số lượt click
    coupons = await Promise.all(
      couponsData.map(async (coupon) => {
        const { count } = await supabase
          .from("clicks")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("coupon_id", coupon.id);

        return { ...coupon, clickCount: count || 0 };
      }),
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Promo Codes</h1>
      <p className="text-gray-600 mb-8">
        A curated list of all best working coupon codes for online stores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between bg-white"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {coupon.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{coupon.store_name}</p>

              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-semibold mb-4">
                {coupon.coupon_code} {/* <-- Đã sửa thành coupon_code */}
              </div>

              <p className="text-sm text-gray-500 font-medium mb-2">
                🔥 {coupon.clickCount} clicks
              </p>
            </div>

            {/* Gọi Component nút bấm vào đây */}
            <GetDealButton coupon={coupon} />
          </div>
        ))}
      </div>
    </div>
  );
}
