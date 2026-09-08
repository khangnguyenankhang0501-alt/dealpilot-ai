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
    .select("*")
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
     GET STORES
  ========================================================= */

  const { data: storeRows, error: storesError } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url");

  if (storesError) {
    console.error("Error fetching stores:", storesError);
  }

  /* =========================================================
     MAP STORE NAME -> STORE DATA
  ========================================================= */

  const storesByName = new Map<
    string,
    {
      id: string;
      name: string | null;
      slug: string | null;
      logo_url: string | null;
    }
  >();

  (storeRows ?? []).forEach((store) => {
    const key = String(store.name ?? "")
      .trim()
      .toLowerCase();

    if (!key) {
      return;
    }

    storesByName.set(key, {
      id: String(store.id),
      name: store.name ?? null,
      slug: store.slug ?? null,
      logo_url: store.logo_url ?? null,
    });
  });

  /* =========================================================
     ADD STORE DATA TO HERO COUPONS
  ========================================================= */

  const heroCoupons = activeCoupons.map((coupon) => {
    const storeName = String(coupon.store_name ?? "")
      .trim()
      .toLowerCase();

    const store = storesByName.get(storeName);

    return {
      ...coupon,
      stores: store
        ? {
            id: store.id,
            name: store.name,
            slug: store.slug,
            logo_url: store.logo_url,
          }
        : null,
    };
  });

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
    <main className="w-full bg-slate-50/30">
      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >
        {/* ===================================================
            HERO
        =================================================== */}

        <section
          className="
            pt-3
            sm:pt-5
            lg:pt-7
          "
        >
          <Hero coupons={heroCoupons} stats={heroStats} />
        </section>

        {/* ===================================================
            TRENDING
        =================================================== */}

        <section
          className="
            mt-9
            sm:mt-11
            lg:mt-12
          "
        >
          <TrendingCoupons />
        </section>

        {/* ===================================================
            FEATURED
        =================================================== */}

        <section
          className="
            mt-11
            sm:mt-13
            lg:mt-14
          "
        >
          <FeaturedCoupons />
        </section>

        {/* ===================================================
            LATEST
        =================================================== */}

        <section
          className="
            mt-11
            pb-10
            sm:mt-13
            sm:pb-14
            lg:mt-14
            lg:pb-18
          "
        >
          <LatestCoupons />
        </section>
      </div>
    </main>
  );
}
