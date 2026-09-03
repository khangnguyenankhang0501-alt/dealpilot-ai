import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function TrendingDeals() {
  const today = new Date().toISOString().split("T")[0];

  const { data: deals, error } = await supabase
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
    console.error("Error fetching trending deals:", error);
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 w-full sm:mt-12">
      {/* HEADER */}
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
            <span className="text-lg sm:text-xl">⚡</span>
            <span>Trending Deals</span>
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
            The hottest deals people are checking right now
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-red-500" />

          <span className="text-xs font-semibold text-gray-500">Hot deals</span>
        </div>
      </div>

      {/* HORIZONTAL DEAL LIST */}
      <div
        className="
          trending-deals-scroll
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
          sm:gap-5
        "
      >
        {deals.map((deal) => (
          <div
            key={deal.id}
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
            <CouponCard coupon={deal} />
          </div>
        ))}
      </div>
    </section>
  );
}
