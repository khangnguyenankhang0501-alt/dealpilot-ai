import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function PopularCoupons() {
  // Ngày hiện tại: YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Lấy các coupon Active và chưa hết hạn
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("click_count", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(2);

  // Không có coupon thì không hiển thị section
  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
    <section className="my-10">
      {/* SECTION HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <span>🔥</span>
          <span>Popular Coupons</span>
        </h2>

        <span className="text-sm text-gray-500">Based on clicks</span>
      </div>

      {/* POPULAR COUPONS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </section>
  );
}
