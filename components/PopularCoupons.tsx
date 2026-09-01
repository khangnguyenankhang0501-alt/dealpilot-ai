import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function PopularCoupons() {
  const today = new Date().toISOString().split("T")[0];

  const { data: coupons, error } = await supabase
    .from("coupons")
    .select(
      `
      *,
      stores!coupons_store_id_fkey (
        id,
        name,
        slug,
        logo_url
      )
    `,
    )
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("click_count", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(10);

  if (error) {
    console.error("Error fetching popular coupons:", error);
  }

  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
    <section className="my-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <span>🔥</span>
          <span>Popular Coupons</span>
        </h2>
        <span className="text-sm text-gray-500">Based on clicks</span>
      </div>

      {/* Thanh trượt ngang */}
      <div className="flex w-full gap-5 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {/* Ô ĐẦU TIÊN: BANNER LỚN (Giống kiểu koupon.ai) */}
        <div className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start flex flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider mb-3">
              Featured Deals
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
              Amazon Promo Codes
            </h3>
            <p className="text-sm text-emerald-100/80 mb-6">
              Discover top-rated verified discounts, promo codes, and special
              offers updated every hour.
            </p>
          </div>
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
            <span>Verified Daily</span>
            <span className="font-bold underline cursor-pointer hover:text-white">
              Explore all →
            </span>
          </div>
          {/* Hiệu ứng trang trí nền */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-700/30 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* CÁC THẺ COUPON TIẾP THEO (Được ép cứng chiều rộng và chiều cao để đều tăm tắp) */}
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start flex"
          >
            <div className="w-full">
              <CouponCard coupon={coupon} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
