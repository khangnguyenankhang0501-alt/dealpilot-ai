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
      stores!store_id (
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

      <div className="flex w-full gap-5 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="min-w-[300px] sm:min-w-[340px] shrink-0 snap-start"
          >
            <CouponCard coupon={coupon} />
          </div>
        ))}
      </div>
    </section>
  );
}
