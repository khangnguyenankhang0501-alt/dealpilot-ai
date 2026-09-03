import type { Metadata } from "next";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Promo Codes | DealPilot",
  description:
    "Find the latest verified promo codes, coupon codes, discounts, and deals on DealPilot.",
};

export default async function PromoCodesPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .not("code", "is", null)
    .neq("code", "")
    .eq("status", "Active")
    .order("created_at", {
      ascending: false,
    });

  const promoCodes = coupons ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* HEADER */}
      <section className="mb-8 sm:mb-10">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-xl
              shadow-sm
            "
          >
            🏷️
          </div>

          <div>
            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-3xl
                lg:text-4xl
              "
            >
              Promo Codes
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Find the latest promo codes and coupon codes from popular stores
              and brands.
            </p>
          </div>
        </div>
      </section>

      {/* PROMO CODE COUNT */}
      {promoCodes.length > 0 && (
        <div className="mb-6 text-sm font-semibold text-slate-500">
          {promoCodes.length} promo code
          {promoCodes.length === 1 ? "" : "s"} available
        </div>
      )}

      {/* PROMO CODES */}
      {promoCodes.length > 0 ? (
        <section
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            sm:gap-5
            lg:grid-cols-3
          "
        >
          {promoCodes.map((coupon) => (
            <div key={coupon.id} className="flex min-w-0 w-full">
              <CouponCard coupon={coupon} />
            </div>
          ))}
        </section>
      ) : (
        <section
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-slate-50
            px-5
            py-14
            text-center
          "
        >
          <div className="text-4xl">🏷️</div>

          <h2 className="mt-4 text-xl font-black text-slate-900">
            No promo codes available
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            There are currently no active promo codes available. Check back
            later for new offers.
          </p>
        </section>
      )}

      {/* SEO CONTENT */}
      <section
        className="
          mt-10
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-5
          sm:p-6
        "
      >
        <h2 className="text-lg font-black text-slate-900">
          Latest Promo Codes & Coupon Codes
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Browse the latest promo codes, coupon codes, discounts, and special
          offers from popular stores on DealPilot. Find active codes and use
          them at checkout to save money on your favorite products and services.
        </p>
      </section>
    </main>
  );
}
