import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Top Brands & Popular Stores | DealPilot",
  description:
    "Discover top brands and popular stores with the latest coupons, promo codes, deals, and discounts on DealPilot.",
};

export default async function TopBrandsPage() {
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url")
    .order("name", {
      ascending: true,
    });

  const brands = stores ?? [];

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
            💎
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
              Top Brands
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Explore popular brands and discover their latest coupons, promo
              codes, and deals.
            </p>
          </div>
        </div>
      </section>

      {/* BRAND COUNT */}
      {brands.length > 0 && (
        <div className="mb-6 text-sm font-semibold text-slate-500">
          {brands.length} popular brand
          {brands.length === 1 ? "" : "s"} available
        </div>
      )}

      {/* BRANDS GRID */}
      {brands.length > 0 ? (
        <section
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-4
            lg:grid-cols-4
            lg:gap-5
          "
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/stores/${brand.slug}`}
              className="
                group
                flex
                min-h-[155px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-5
                text-center
                shadow-[0_6px_24px_rgba(15,23,42,0.04)]
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-emerald-300
                hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                sm:min-h-[175px]
                sm:px-5
              "
            >
              {/* LOGO */}
              <div
                className="
                  relative
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-sm
                  transition-transform
                  duration-200
                  group-hover:scale-105
                  sm:h-20
                  sm:w-20
                "
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name || "Brand"}
                    fill
                    sizes="80px"
                    className="object-contain p-2.5"
                  />
                ) : (
                  <span
                    className="
                      text-2xl
                      font-black
                      text-slate-400
                      sm:text-3xl
                    "
                  >
                    {brand.name?.charAt(0)?.toUpperCase() || "B"}
                  </span>
                )}
              </div>

              {/* BRAND NAME */}
              <h2
                className="
                  mt-3
                  w-full
                  truncate
                  text-sm
                  font-extrabold
                  text-slate-900
                  transition-colors
                  group-hover:text-emerald-600
                  sm:text-base
                "
              >
                {brand.name}
              </h2>

              {/* CTA */}
              <span
                className="
                  mt-1
                  text-[11px]
                  font-semibold
                  text-slate-400
                  transition-colors
                  group-hover:text-emerald-500
                  sm:text-xs
                "
              >
                View coupons →
              </span>
            </Link>
          ))}
        </section>
      ) : (
        /* EMPTY STATE */
        <section
          className="
            flex
            min-h-[240px]
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
            <div className="text-4xl">💎</div>

            <h2 className="mt-4 text-xl font-black text-slate-900">
              No brands available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no brands available. Please check back later
              for more stores and deals.
            </p>

            <Link
              href="/stores"
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
              Browse All Stores →
            </Link>
          </div>
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
          Popular Brands on DealPilot
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Discover popular brands and stores on DealPilot. Browse each brand to
          find active coupon codes, promo codes, discounts, and the latest deals
          available to help you save more.
        </p>
      </section>
    </main>
  );
}
