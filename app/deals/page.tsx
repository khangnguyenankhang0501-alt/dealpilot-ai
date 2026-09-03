import type { Metadata } from "next";

import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const metadata: Metadata = {
  title: "Over 50% Off Deals | DealPilot",
  description:
    "Discover amazing deals with 50% off or more. Find verified coupons, promo codes, and discounts on DealPilot.",
};

export const revalidate = 0;

export default async function DealsPage() {
  const today = new Date().toISOString();

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
    .gte("discount_value", 50)
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("discount_value", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(24);

  if (error) {
    console.error("Error fetching 50%+ deals:", error);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="mb-8 sm:mb-10">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-xl
              shadow-sm
              sm:h-11
              sm:w-11
            "
          >
            🔥
          </div>

          <div className="min-w-0">
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
              Over 50% Off Deals
            </h1>

            <p
              className="
                mt-1.5
                max-w-2xl
                text-xs
                leading-5
                text-slate-500
                sm:text-sm
              "
            >
              Discover amazing deals with 50% off or more and save more on your
              favorite products and stores.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!deals || deals.length === 0 ? (
        <section
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-slate-50
            px-6
            py-12
            text-center
          "
        >
          <div>
            <div className="text-4xl">🏷️</div>

            <h2 className="mt-4 text-lg font-black text-slate-900">
              No 50%+ deals available
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are currently no active deals with a discount of 50% or
              more. Please check back later.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* =================================================
              DEALS SUMMARY
          ================================================== */}

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              shadow-sm
              sm:px-5
            "
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-bold text-slate-500 sm:text-sm">
                {deals.length} deals available
              </span>
            </div>

            <span className="text-xs font-black text-emerald-600 sm:text-sm">
              50%+ OFF
            </span>
          </div>

          {/* =================================================
              DEAL GRID
          ================================================== */}

          <section
            className="
              grid
              w-full
              grid-cols-1
              items-stretch
              gap-4
              sm:grid-cols-2
              sm:gap-5
              lg:grid-cols-3
            "
          >
            {deals.map((deal) => (
              <div key={deal.id} className="flex min-w-0 w-full max-w-full">
                <CouponCard coupon={deal} />
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
