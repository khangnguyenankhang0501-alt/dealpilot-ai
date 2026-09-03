import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumb";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

/* =========================================================
   CATEGORY DATA
========================================================= */

const CATEGORIES = {
  fashion: {
    name: "Fashion",
    description:
      "Discover the latest fashion coupons, promo codes, clothing deals, and discounts from popular brands.",
  },

  electronics: {
    name: "Electronics",
    description:
      "Find the latest electronics coupons, promo codes, gadget deals, and tech discounts.",
  },

  travel: {
    name: "Travel",
    description:
      "Save on travel with hotel discounts, booking promo codes, flights, and travel deals.",
  },

  software: {
    name: "Software",
    description:
      "Discover software deals, SaaS discounts, VPN promo codes, and application offers.",
  },

  furniture: {
    name: "Furniture",
    description:
      "Find furniture coupons, home deals, discounts, and promo codes from popular stores.",
  },

  beauty: {
    name: "Beauty",
    description:
      "Discover beauty coupons, skincare deals, makeup discounts, and personal care promo codes.",
  },

  household: {
    name: "Household",
    description:
      "Save on household products, home essentials, cleaning supplies, and everyday deals.",
  },
} as const;

type CategorySlug = keyof typeof CATEGORIES;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/* =========================================================
   CATEGORY VALIDATION
========================================================= */

function isValidCategory(slug: string): slug is CategorySlug {
  return slug in CATEGORIES;
}

/* =========================================================
   SEO
========================================================= */

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  if (!isValidCategory(slug)) {
    return {
      title: "Category Not Found | DealPilot",
      description: "The requested DealPilot category could not be found.",
    };
  }

  const category = CATEGORIES[slug];

  return {
    title: `${category.name} Coupons, Promo Codes & Deals | DealPilot`,
    description: category.description,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function CategoryDetailPage({
  params,
}: CategoryPageProps) {
  const resolvedParams = await params;

  const categorySlug = resolvedParams.slug.toLowerCase();

  if (!isValidCategory(categorySlug)) {
    notFound();
  }

  const category = CATEGORIES[categorySlug];
  const categoryName = category.name;

  const today = new Date().toISOString();

  /* =======================================================
     GET ACTIVE COUPONS
  ======================================================= */

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
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (couponsError) {
    console.error("Error fetching category coupons:", couponsError);
  }

  /*
   * NOTE:
   * Hiện tại schema coupon chưa có trường category rõ ràng
   * trong code hiện tại, vì vậy tạm thời lọc bằng title,
   * description và store_name.
   *
   * Khi bảng coupons có cột category/category_slug,
   * nên chuyển sang filter trực tiếp bằng cột đó.
   */

  const filteredCoupons = (coupons ?? []).filter((coupon) => {
    const searchText = [coupon.title, coupon.description, coupon.store_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const keywords: Record<CategorySlug, string[]> = {
      fashion: [
        "fashion",
        "clothing",
        "apparel",
        "shoes",
        "dress",
        "shirt",
        "jeans",
        "wear",
      ],

      electronics: [
        "electronics",
        "electronic",
        "phone",
        "laptop",
        "computer",
        "tablet",
        "tech",
        "gadget",
        "headphone",
        "camera",
      ],

      travel: [
        "travel",
        "hotel",
        "flight",
        "booking",
        "vacation",
        "airline",
        "resort",
        "trip",
      ],

      software: [
        "software",
        "saas",
        "vpn",
        "app",
        "application",
        "hosting",
        "cloud",
        "security",
      ],

      furniture: [
        "furniture",
        "sofa",
        "chair",
        "table",
        "bed",
        "mattress",
        "home decor",
        "decor",
      ],

      beauty: [
        "beauty",
        "makeup",
        "cosmetic",
        "skincare",
        "skin care",
        "hair",
        "haircare",
        "personal care",
      ],

      household: [
        "household",
        "home",
        "cleaning",
        "kitchen",
        "laundry",
        "storage",
        "appliance",
        "home essentials",
      ],
    };

    return keywords[categorySlug].some((keyword) =>
      searchText.includes(keyword),
    );
  });

  /* =======================================================
     UNIQUE STORES
  ======================================================= */

  const storeMap = new Map<
    string,
    {
      id: string | number;
      name: string;
      slug: string;
      logo_url: string | null;
    }
  >();

  filteredCoupons.forEach((coupon) => {
    const store = Array.isArray(coupon.stores)
      ? coupon.stores[0]
      : coupon.stores;

    if (!store?.id) {
      return;
    }

    if (!storeMap.has(String(store.id))) {
      storeMap.set(String(store.id), {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logo_url: store.logo_url,
      });
    }
  });

  const stores = Array.from(storeMap.values());

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const totalCoupons = filteredCoupons.length;

  const bestDiscount =
    filteredCoupons.reduce((max, coupon) => {
      const value = Number(coupon.discount_value) || 0;

      return value > max ? value : max;
    }, 0) || 0;

  /* =======================================================
     PAGE
  ======================================================= */

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
            label: "Categories",
            href: "/categories",
          },
          {
            label: categoryName,
            href: "#",
          },
        ]}
      />

      {/* =====================================================
          HERO
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
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              {/* ICON */}

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-50
                  text-3xl
                  shadow-sm
                  sm:h-20
                  sm:w-20
                  sm:text-4xl
                "
              >
                {categorySlug === "fashion" && "👕"}
                {categorySlug === "electronics" && "💻"}
                {categorySlug === "travel" && "✈️"}
                {categorySlug === "software" && "💻"}
                {categorySlug === "furniture" && "🛋️"}
                {categorySlug === "beauty" && "💄"}
                {categorySlug === "household" && "🏠"}
              </div>

              {/* TEXT */}

              <div className="min-w-0">
                <span
                  className="
                    inline-flex
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
                  Category
                </span>

                <h1
                  className="
                    mt-2
                    text-2xl
                    font-black
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                    lg:text-4xl
                  "
                >
                  {categoryName} Coupons & Deals
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                  {category.description}
                </p>
              </div>
            </div>

            <Link
              href="/categories"
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
              All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* COUPONS */}

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
            {totalCoupons}
          </div>
        </div>

        {/* STORES */}

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
            <span className="text-xs font-bold text-slate-500">Stores</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-sm">
              🏪
            </span>
          </div>

          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {stores.length}
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

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm">
              🔥
            </span>
          </div>

          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {bestDiscount > 0 ? `${bestDiscount}%` : "—"}
          </div>
        </div>
      </section>

      {/* =====================================================
          COUPONS
      ====================================================== */}

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Top {categoryName} Coupons
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Browse the latest active {categoryName.toLowerCase()} deals and
              promo codes.
            </p>
          </div>

          {totalCoupons > 0 && (
            <span className="hidden shrink-0 text-xs font-bold text-slate-400 sm:block">
              {totalCoupons} deals
            </span>
          )}
        </div>

        {filteredCoupons.length > 0 ? (
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
            {filteredCoupons.map((coupon) => (
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

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are currently no active {categoryName.toLowerCase()} deals
              available.
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
          STORES
      ====================================================== */}

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Top {categoryName} Stores
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Explore stores offering {categoryName.toLowerCase()} coupons and
            deals.
          </p>
        </div>

        {stores.length > 0 ? (
          <div
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
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="
                  group
                  flex
                  min-h-[145px]
                  min-w-0
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
                "
              >
                {/* LOGO */}

                <div
                  className="
                    relative
                    flex
                    h-14
                    w-14
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
                    sm:h-16
                    sm:w-16
                  "
                >
                  {store.logo_url ? (
                    <Image
                      src={store.logo_url}
                      alt={store.name || "Store"}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">
                      {store.name?.charAt(0)?.toUpperCase() || "S"}
                    </span>
                  )}
                </div>

                {/* NAME */}

                <h3
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
                  {store.name}
                </h3>

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
              py-10
              text-center
            "
          >
            <div className="text-3xl">🏪</div>

            <p className="mt-3 text-sm text-slate-500">
              No stores are currently available in this category.
            </p>

            <Link
              href="/stores"
              className="
                mt-4
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
                font-bold
                text-slate-600
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
              "
            >
              Browse All Stores
            </Link>
          </div>
        )}
      </section>

      {/* =====================================================
          SEO CONTENT
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
          About {categoryName} Coupons & Deals
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Find the latest {categoryName.toLowerCase()} coupons, promo codes,
          discounts, and deals on DealPilot. Browse active offers from popular
          stores, compare available discounts, and use coupon codes at checkout
          to save money.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/categories"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-bold
              text-slate-600
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            All Categories
          </Link>

          <Link
            href="/coupons"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-bold
              text-slate-600
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            All Coupons
          </Link>

          <Link
            href="/promo-codes"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-bold
              text-slate-600
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            Promo Codes
          </Link>

          <Link
            href="/trending"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-bold
              text-slate-600
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            Trending Deals
          </Link>
        </div>
      </section>
    </main>
  );
}
