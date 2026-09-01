import PopularCoupons from "@/components/PopularCoupons";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DealPilot - Best Coupon Codes, Promo Codes & Discounts",
  description:
    "Find and save with the latest verified promo codes, discount coupons, and deals for thousands of online stores. Updated daily.",
};

export const revalidate = 0;

export default async function HomePage() {
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
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching coupons:", error);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PopularCoupons />

      <h1 className="mt-12 mb-8 text-4xl font-bold">Latest Coupons</h1>

      {coupons && coupons.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
          No active coupons available right now.
        </div>
      )}
    </main>
  );
}
