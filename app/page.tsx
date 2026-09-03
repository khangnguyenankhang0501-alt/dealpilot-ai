import PopularCoupons from "@/components/PopularCoupons";
import TrendingCoupons from "@/components/TrendingCoupons";
import LatestCoupons from "@/components/LatestCoupons";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FeaturedCoupons from "@/components/FeaturedCoupons";

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
      nullsFirst: false,
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
     HERO STATS
  ========================================================= */

  const heroStats = {
    dealsTracked,
    newDeals,
    verifiedPercentage,
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="w-full">
      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ===================================================
            HERO
        =================================================== */}

        <section className="pt-4 sm:pt-6 lg:pt-8">
          <Hero coupons={activeCoupons} stats={heroStats} />
        </section>

        {/* ===================================================
            FEATURED
        =================================================== */}

        <section className="mt-8 sm:mt-10 lg:mt-12">
          <FeaturedCoupons />
        </section>

        {/* ===================================================
            POPULAR
        =================================================== */}

        <section className="mt-8 sm:mt-10 lg:mt-12">
          <PopularCoupons />
        </section>

        {/* ===================================================
            TRENDING
        =================================================== */}

        <section className="mt-8 sm:mt-10 lg:mt-12">
          <TrendingCoupons />
        </section>

        {/* ===================================================
            LATEST
        =================================================== */}

        <section className="mt-8 pb-8 sm:mt-10 sm:pb-12 lg:mt-12 lg:pb-16">
          <LatestCoupons />
        </section>
      </div>
    </main>
  );
}
