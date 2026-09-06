import Link from "next/link";
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

  const { data: coupons } = await supabase
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

  const activeCoupons = coupons ?? [];

  /* =========================================================
     STATS
  ========================================================= */

  const verifiedCount = activeCoupons.filter(
    (coupon) => coupon.verified === true,
  ).length;

  const promoCodeCount = activeCoupons.filter(
    (coupon) =>
      typeof coupon.coupon_code === "string" &&
      coupon.coupon_code.trim().length > 0,
  ).length;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="w-full bg-white">
      {/* =======================================================
          HERO / PAGE HEADER
      ======================================================= */}

      <section className="border-b border-slate-200 bg-slate-50/70">
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-4
            py-8
            sm:px-6
            sm:py-10
            lg:px-8
            lg:py-12
          "
        >
          {/* ===================================================
              BREADCRUMB
          =================================================== */}

          <nav
            aria-label="Breadcrumb"
            className="
              mb-5
              flex
              items-center
              gap-1.5
              text-[11px]
              font-semibold
              text-slate-400
              sm:text-xs
            "
          >
            <Link href="/" className="transition-colors hover:text-emerald-600">
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-slate-600">Coupons</span>
          </nav>

          {/* ===================================================
              TITLE AREA
          =================================================== */}

          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div className="max-w-3xl">
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    text-xl
                    shadow-sm
                    sm:h-12
                    sm:w-12
                    sm:text-2xl
                  "
                >
                  🏷️
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      mb-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-emerald-600
                      sm:text-[11px]
                    "
                  >
                    DealPilot Coupons
                  </div>

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
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-6
                      text-slate-500
                      sm:text-base
                    "
                  >
                    Browse the latest verified promo codes, discounts, and
                    shopping deals from stores you love.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                HOME BUTTON
            ================================================= */}

            <div className="shrink-0">
              <Link
                href="/"
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-xs
                  font-extrabold
                  text-slate-700
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-600
                "
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* ===================================================
              STATS
          =================================================== */}

          <div
            className="
              mt-7
              grid
              grid-cols-1
              gap-2.5
              sm:grid-cols-3
            "
          >
            {/* ACTIVE */}

            <div
              className="
                flex
                min-h-[68px]
                items-center
                justify-between
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                shadow-sm
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Active Deals
                </div>

                <div
                  className="
                    mt-1
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  {activeCoupons.length}
                </div>
              </div>

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-50
                  text-sm
                "
              >
                ⚡
              </div>
            </div>

            {/* VERIFIED */}

            <div
              className="
                flex
                min-h-[68px]
                items-center
                justify-between
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/60
                px-4
                py-3
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-emerald-600
                  "
                >
                  Verified
                </div>

                <div
                  className="
                    mt-1
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  {verifiedCount}
                </div>
              </div>

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-sm
                  shadow-sm
                "
              >
                ✓
              </div>
            </div>

            {/* PROMO CODES */}

            <div
              className="
                flex
                min-h-[68px]
                items-center
                justify-between
                rounded-2xl
                border
                border-cyan-100
                bg-cyan-50/60
                px-4
                py-3
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-cyan-700
                  "
                >
                  Promo Codes
                </div>

                <div
                  className="
                    mt-1
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  {promoCodeCount}
                </div>
              </div>

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-sm
                  shadow-sm
                "
              >
                %
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
          lg:py-12
        "
      >
        {activeCoupons.length > 0 ? (
          <>
            {/* =================================================
                SECTION HEADER
            ================================================= */}

            <div
              className="
                mb-6
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
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

                  <h2
                    className="
                      text-xl
                      font-black
                      tracking-tight
                      text-slate-900
                      sm:text-2xl
                    "
                  >
                    Latest Available Coupons
                  </h2>
                </div>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Fresh deals currently available on DealPilot.
                </p>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-slate-500
                  shadow-sm
                  sm:text-[11px]
                "
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className="
                      absolute
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-50
                    "
                  />

                  <span
                    className="
                      relative
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-emerald-500
                    "
                  />
                </span>
                Live deals
              </div>
            </div>

            {/* =================================================
                COUPON GRID
            ================================================= */}

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

            {/* =================================================
                BOTTOM TRUST BAR
            ================================================= */}

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-sm
                    shadow-sm
                  "
                >
                  ✓
                </div>

                <div>
                  <div
                    className="
                      text-xs
                      font-black
                      text-slate-900
                    "
                  >
                    Shop smarter with DealPilot
                  </div>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      leading-5
                      text-slate-500
                      sm:text-xs
                    "
                  >
                    Active offers are checked before they are displayed.
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-900
                  px-4
                  text-[10px]
                  font-extrabold
                  text-white
                  transition
                  hover:bg-slate-700
                  sm:text-xs
                "
              >
                Explore more deals →
              </Link>
            </div>
          </>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              flex
              min-h-[320px]
              flex-col
              items-center
              justify-center
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              px-6
              py-14
              text-center
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-3xl
                shadow-sm
              "
            >
              🏷️
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-black
                text-slate-900
                sm:text-xl
              "
            >
              No coupons available
            </h2>

            <p
              className="
                mt-2
                max-w-md
                text-xs
                leading-6
                text-slate-500
                sm:text-sm
              "
            >
              There are no active coupons available right now. Check back later
              for new deals and promo codes.
            </p>

            <Link
              href="/"
              className="
                mt-6
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
                shadow-sm
                transition-all
                hover:bg-emerald-400
                hover:shadow-md
              "
            >
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
