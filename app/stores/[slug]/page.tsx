import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumb";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

interface StorePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 0;

/* =========================================================
   HELPERS
========================================================= */

function formatStoreName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* =========================================================
   SEO
========================================================= */

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: store } = await supabase
    .from("stores")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();

  const storeName = store?.name || formatStoreName(slug);

  return {
    title: `${storeName} Coupons & Promo Codes | DealPilot`,
    description:
      store?.description ||
      `Find the latest ${storeName} coupons, promo codes, deals, and discounts on DealPilot.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function StorePage({
  params,
  searchParams,
}: StorePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;
  const storeNameFromSlug = formatStoreName(slug);

  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);

  const pageSize = 6;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;

  const today = new Date().toISOString();

  /* =========================================================
     GET STORE
  ========================================================= */

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select(
      `
      id,
      name,
      slug,
      logo_url,
      description
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (storeError) {
    console.error("Error fetching store:", storeError);
  }

  /* =========================================================
     STORE NOT FOUND
  ========================================================= */

  if (!store) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Stores", href: "/stores" },
            { label: storeNameFromSlug, href: "#" },
          ]}
        />

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            🏪
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Store not found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            We could not find this store. Please check the URL or browse all
            available stores.
          </p>

          <Link
            href="/stores"
            className="
              mt-6
              inline-flex
              h-11
              items-center
              justify-center
              rounded-xl
              bg-emerald-500
              px-5
              text-sm
              font-black
              text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.20)]
              transition
              hover:-translate-y-0.5
              hover:bg-emerald-400
            "
          >
            Browse Stores →
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     TOTAL ACTIVE COUPONS
  ========================================================= */

  const { count: totalCoupons, error: countError } = await supabase
    .from("coupons")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("store_id", store.id)
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`);

  if (countError) {
    console.error("Error counting store coupons:", countError);
  }

  /* =========================================================
     GET COUPONS
  ========================================================= */

  const { data: coupons, error: couponsError } = await supabase
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
    .eq("store_id", store.id)
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .range(startIndex, endIndex);

  if (couponsError) {
    console.error("Error fetching store coupons:", couponsError);
  }

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const activeCoupons = totalCoupons || 0;

  const bestDiscount =
    coupons?.reduce((max, coupon) => {
      const value = Number(coupon.discount_value) || 0;

      return value > max ? value : max;
    }, 0) || 0;

  const totalPages = Math.ceil(activeCoupons / pageSize);

  const storeName = store.name || storeNameFromSlug;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Stores",
            href: "/stores",
          },
          {
            label: storeName,
            href: "#",
          },
        ]}
      />

      {/* =====================================================
          STORE HERO
      ====================================================== */}

      <section
        className="
          mt-6
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.05)]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            p-5
            sm:p-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          {/* STORE INFO */}

          <div className="flex min-w-0 items-center gap-4">
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
                border-slate-200
                bg-white
                shadow-sm
                sm:h-20
                sm:w-20
              "
            >
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={storeName}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-black text-slate-400">
                  {storeName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* NAME */}

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="
                    rounded-full
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wide
                    text-emerald-600
                  "
                >
                  Store
                </span>

                {activeCoupons > 0 && (
                  <span
                    className="
                      hidden
                      rounded-full
                      bg-slate-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-slate-500
                      sm:inline-flex
                    "
                  >
                    {activeCoupons} active deals
                  </span>
                )}
              </div>

              <h1
                className="
                  truncate
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                {storeName} Coupons
              </h1>

              {store.description && (
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
                  {store.description}
                </p>
              )}
            </div>
          </div>

          {/* STORE LINK */}

          <Link
            href="/stores"
            className="
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-xs
              font-bold
              text-slate-700
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
              sm:text-sm
            "
          >
            All Stores
          </Link>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* ACTIVE */}

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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Active Coupons
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm">
              🎟️
            </span>
          </div>

          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {activeCoupons}
          </div>
        </div>

        {/* BEST DISCOUNT */}

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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Best Discount
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-sm">
              🔥
            </span>
          </div>

          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {bestDiscount > 0 ? `${bestDiscount}%` : "—"}
          </div>
        </div>

        {/* UPDATED */}

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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Updated</span>

            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div className="mt-2 text-sm font-black text-slate-900 sm:text-base">
            Today
          </div>
        </div>
      </section>

      {/* =====================================================
          COUPONS HEADER
      ====================================================== */}

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {storeName} Deals & Coupons
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Browse the latest active deals and promo codes from {storeName}.
            </p>
          </div>

          {activeCoupons > 0 && (
            <div className="hidden shrink-0 text-xs font-bold text-slate-400 sm:block">
              {activeCoupons} deals
            </div>
          )}
        </div>

        {/* ===================================================
            COUPON GRID
        ==================================================== */}

        {coupons && coupons.length > 0 ? (
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
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex min-w-0 w-full max-w-full">
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>
        ) : (
          <div
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

            <h3 className="mt-4 text-lg font-black text-slate-900">
              No active coupons
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are currently no active deals available for this store.
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
                px-4
                text-xs
                font-black
                text-white
                transition
                hover:bg-emerald-400
              "
            >
              Browse All Coupons →
            </Link>
          </div>
        )}
      </section>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {totalPages > 1 && (
        <nav
          className="
            mt-8
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
          "
          aria-label="Store coupon pagination"
        >
          {/* PREVIOUS */}

          {currentPage > 1 && (
            <Link
              href={`/stores/${slug}?page=${currentPage - 1}`}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                text-xs
                font-bold
                text-slate-600
                shadow-sm
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
                sm:text-sm
              "
            >
              ←
            </Link>
          )}

          {/* PAGE NUMBERS */}

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;

            return (
              <Link
                key={page}
                href={`/stores/${slug}?page=${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={`
                  inline-flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  px-3
                  text-xs
                  font-black
                  shadow-sm
                  transition
                  sm:text-sm
                  ${
                    currentPage === page
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }
                `}
              >
                {page}
              </Link>
            );
          })}

          {/* NEXT */}

          {currentPage < totalPages && (
            <Link
              href={`/stores/${slug}?page=${currentPage + 1}`}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                text-xs
                font-bold
                text-slate-600
                shadow-sm
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
                sm:text-sm
              "
            >
              →
            </Link>
          )}
        </nav>
      )}

      {/* =====================================================
          SEO TEXT
      ====================================================== */}

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
          About {storeName} Coupons
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Find the latest {storeName} promo codes, coupon codes, discounts, and
          deals on DealPilot. Browse active offers, compare discounts, and use
          the available coupon code at checkout to save money.
        </p>
      </section>
    </main>
  );
}
