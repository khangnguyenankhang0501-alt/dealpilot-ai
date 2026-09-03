import PopularCoupons from "@/components/PopularCoupons";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";
import Hero from "@/components/Hero";

export const metadata: Metadata = {
  title: "DealPilot - Best Coupon Codes, Promo Codes & Discounts",
  description:
    "Find and save with the latest verified promo codes, discount coupons, and deals for thousands of online stores. Updated daily.",
};

export const revalidate = 0;

export default async function HomePage() {
  /* =========================================================
     CURRENT TIME
  ========================================================= */

  const today = new Date().toISOString();

  /* =========================================================
     GET ACTIVE COUPONS
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
    })
    .limit(50);

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  if (error) {
    console.error("Error fetching coupons:", error);
  }

  const activeCoupons = coupons ?? [];

  /* =========================================================
     HERO STATS
  ========================================================= */

  const dealsTracked = activeCoupons.length;

  /* =========================================================
     NEW DEALS - LAST 24 HOURS
  ========================================================= */

  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  const newDeals = activeCoupons.filter((coupon) => {
    if (!coupon.created_at) {
      return false;
    }

    const createdAt = new Date(coupon.created_at).getTime();

    if (!Number.isFinite(createdAt)) {
      return false;
    }

    return createdAt >= twentyFourHoursAgo;
  }).length;

  /* =========================================================
     VERIFIED COUPONS
  ========================================================= */

  const verifiedCoupons = activeCoupons.filter(
    (coupon) => coupon.verified === true,
  ).length;

  const verifiedPercentage =
    activeCoupons.length > 0
      ? Math.round((verifiedCoupons / activeCoupons.length) * 100)
      : 0;

  /* =========================================================
     HERO STATS OBJECT
  ========================================================= */

  const heroStats = {
    dealsTracked,
    newDeals,
    verifiedPercentage,
  };

  /* =========================================================
     LATEST COUPONS
     
     activeCoupons đã được sắp xếp created_at DESC
     nên các coupon đầu tiên chính là coupon mới nhất.
  ========================================================= */

  const latestCoupons = activeCoupons.slice(0, 12);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        py-5
        sm:px-6
        sm:py-8
        lg:px-8
      "
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero coupons={activeCoupons} stats={heroStats} />

      {/* =====================================================
          POPULAR COUPONS
      ===================================================== */}

      <PopularCoupons />

      {/* =====================================================
          LATEST COUPONS
      ===================================================== */}

      <section
        className="
          mt-10
          w-full
          sm:mt-12
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            mb-5
            flex
            items-end
            justify-between
            gap-4
            sm:mb-6
          "
        >
          <div className="min-w-0">
            <h2
              className="
                text-xl
                font-extrabold
                tracking-tight
                text-gray-900
                sm:text-2xl
              "
            >
              Latest Coupons
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
                sm:text-sm
              "
            >
              Fresh coupon codes and deals added recently
            </p>
          </div>

          {/* UPDATED STATUS */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-2
              sm:flex
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-emerald-500
              "
            />

            <span
              className="
                text-xs
                font-semibold
                text-gray-500
              "
            >
              Updated today
            </span>
          </div>
        </div>

        {/* ===================================================
            COUPON GRID
        =================================================== */}

        {latestCoupons.length > 0 ? (
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
            {latestCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="
                  min-w-0
                  w-full
                  max-w-full
                "
              >
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-5
              py-12
              text-center
              text-sm
              text-gray-500
              shadow-sm
            "
          >
            No active coupons available right now.
          </div>
        )}
      </section>
    </main>
  );
}
