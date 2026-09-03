import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function LatestDeals() {
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
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(10);

  if (error) {
    console.error("Error fetching latest deals:", error);
  }

  if (!coupons || coupons.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 w-full sm:mt-12">
      {/* HEADER */}
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            <span className="text-lg sm:text-xl">⚡</span>
            <span>Latest Deals</span>
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Fresh deals added recently
          </p>
        </div>

        {/* DESKTOP VIEW ALL */}
        <a
          href="/deals"
          className="
            hidden
            shrink-0
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-xs
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
            sm:block
          "
        >
          View All →
        </a>
      </div>

      {/* HORIZONTAL DEAL LIST */}
      <div
        className="
          latest-deals-scroll
          flex
          w-full
          gap-4
          overflow-x-auto
          overflow-y-hidden
          pb-5
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
              w-[280px]
              min-w-[280px]
              max-w-[280px]
              shrink-0
              snap-start
              sm:w-[300px]
              sm:min-w-[300px]
              sm:max-w-[300px]
            "
          >
            <CouponCard coupon={coupon} />
          </div>
        ))}
      </div>

      {/* MOBILE VIEW ALL */}
      <div className="mt-1 flex justify-center sm:hidden">
        <a
          href="/deals"
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-xs
            font-bold
            text-slate-700
            shadow-sm
            transition
            active:scale-95
          "
        >
          View All Deals →
        </a>
      </div>
    </section>
  );
}
