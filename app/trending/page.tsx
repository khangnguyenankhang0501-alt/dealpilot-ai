import type { Metadata } from "next";
import Link from "next/link";

import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Trending Coupons & Deals | DealPilot",
  description:
    "Discover trending coupons, promo codes, and hot deals updated regularly on DealPilot.",
};

export default async function TrendingPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("status", "Active")
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    });

  const trendingCoupons = coupons ?? [];

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
            🔥
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
              Trending Coupons & Deals
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Discover the latest trending coupons, promo codes, and hot deals
              on DealPilot.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
          "
        >
          <div className="text-xs font-bold text-slate-500">
            Trending Offers
          </div>

          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {trendingCoupons.length}
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
          "
        >
          <div className="text-xs font-bold text-slate-500">Active Deals</div>

          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-600">
            {trendingCoupons.length}
          </div>
        </div>

        <div
          className="
            col-span-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            sm:col-span-1
          "
        >
          <div className="text-xs font-bold text-slate-500">Updated</div>

          <div className="mt-2 text-sm font-black text-slate-900 sm:text-base">
            Today
          </div>
        </div>
      </section>

      {/* TRENDING COUPONS */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Hot Deals Right Now
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Explore the latest active offers and coupon codes.
            </p>
          </div>

          {trendingCoupons.length > 0 && (
            <span className="hidden shrink-0 text-xs font-bold text-slate-400 sm:block">
              {trendingCoupons.length} offers
            </span>
          )}
        </div>

        {trendingCoupons.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              sm:gap-5
              lg:grid-cols-3
            "
          >
            {trendingCoupons.map((coupon) => (
              <div key={coupon.id} className="flex min-w-0 w-full">
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
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
            <div className="text-4xl">🔥</div>

            <h2 className="mt-4 text-xl font-black text-slate-900">
              No trending deals available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no active trending deals. Check back later for
              new offers.
            </p>

            <Link
              href="/coupons"
              className="
                mt-5
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-500
                px-5
                text-xs
                font-black
                text-white
                transition
                hover:bg-emerald-400
              "
            >
              Browse All Coupons →
            </Link>
          </section>
        )}
      </section>

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
          Trending Coupons & Deals on DealPilot
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Find trending coupons, promo codes, discounts, and hot deals from
          popular stores on DealPilot. Browse the latest active offers and
          discover new ways to save money when shopping online.
        </p>
      </section>
    </main>
  );
}
