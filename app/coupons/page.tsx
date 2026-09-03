import type { Metadata } from "next";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Coupons & Promo Codes | DealPilot",
  description:
    "Discover the latest working promo codes, discounts, and offers. Save big today!",
};

export default async function AllCouponsPage() {
  /* =========================================================
     CURRENT TIME
  ========================================================= */

  const today = new Date().toISOString();

  /* =========================================================
     FETCH ACTIVE COUPONS
  ========================================================= */

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
    });

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  if (error) {
    console.error("Error fetching all coupons:", error);
  }

  const activeCoupons = coupons ?? [];

  return (
    <main className="w-full">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-slate-50/70">
        <div
          className="
            mx-auto
            w-full
            max-w-6xl
            px-4
            py-8
            sm:px-6
            sm:py-10
            lg:px-8
          "
        >
          {/* BREADCRUMB */}

          <div className="mb-4 text-xs font-semibold text-slate-400">
            Home <span className="mx-1">/</span> Coupons
          </div>

          {/* TITLE */}

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
                text-lg
                shadow-sm
                sm:h-11
                sm:w-11
              "
            >
              🏷️
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
                All Coupons & Deals
              </h1>

              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                  sm:text-base
                "
              >
                Browse the latest verified discounts, promo codes, and deals
                from popular online stores.
              </p>
            </div>
          </div>

          {/* STATS */}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div
              className="
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-bold
                text-slate-600
                shadow-sm
              "
            >
              {activeCoupons.length} Active Deals
            </div>

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-1.5
                text-xs
                font-bold
                text-emerald-700
              "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Updated live
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COUPON CONTENT
      ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
        "
      >
        {activeCoupons.length > 0 ? (
          <>
            {/* SECTION HEADER */}

            <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
              <div>
                <h2
                  className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  Latest Coupons
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Fresh deals currently available on DealPilot.
                </p>
              </div>
            </div>

            {/* COUPON GRID */}

            <div
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
              {activeCoupons.map((coupon) => (
                <div key={coupon.id} className="flex min-w-0 w-full max-w-full">
                  <CouponCard coupon={coupon} />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              flex
              min-h-[260px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              px-5
              py-12
              text-center
            "
          >
            <div className="text-4xl">🏷️</div>

            <h2 className="mt-4 text-lg font-black text-slate-800">
              No coupons available
            </h2>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are no active coupons available right now. Please check back
              later for new deals.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
