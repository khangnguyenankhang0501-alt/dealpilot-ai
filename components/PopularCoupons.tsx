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
    <section className="my-8 w-full sm:my-10">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            <span className="text-lg sm:text-xl">🔥</span>
            <span>Popular Coupons</span>
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Top deals based on popularity
          </p>
        </div>

        {/* UPDATED STATUS */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-slate-500">
            Updated today
          </span>
        </div>
      </div>

      {/* =====================================================
          HORIZONTAL COUPON SCROLLER
      ===================================================== */}
      <div
        className="
          popular-coupons-scroll
          flex
          w-full
          gap-4
          overflow-x-auto
          overflow-y-hidden
          pb-4
          pt-1
          snap-x
          snap-mandatory
          scroll-smooth
          overscroll-x-contain
          touch-pan-x
          [-webkit-overflow-scrolling:touch]

          [scrollbar-width:auto]

          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-400

          sm:gap-5
        "
      >
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="
              w-[270px]
              min-w-[270px]
              max-w-[270px]
              shrink-0
              snap-start

              sm:w-[290px]
              sm:min-w-[290px]
              sm:max-w-[290px]
            "
          >
            <CouponCard coupon={coupon} />
          </div>
        ))}
      </div>

      {/* =====================================================
          MOBILE SCROLL HINT
      ===================================================== */}
      {coupons.length > 1 && (
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 sm:hidden">
          <span>Swipe to explore</span>
          <span>→</span>
        </div>
      )}
    </section>
  );
}
