import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import { supabase } from "@/lib/supabaseClient";
import GetCodeButton from "@/components/GetCodeButton";
import CouponCard from "@/components/CouponCard";
import FavoriteButton from "@/components/FavoriteButton";

type Props = {
  params: Promise<{ slug: string }>;
};

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const { data: coupon } = await supabase
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
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return {
      title: "Coupon Not Found | DealPilot",
      description:
        "The coupon you are looking for could not be found on DealPilot.",
    };
  }

  const storeName = coupon.stores?.name || coupon.store_name || "Store";

  return {
    title: `${coupon.title} | ${storeName} Coupons | DealPilot`,
    description: `Get the latest discount and coupon details for ${coupon.title} from ${storeName}. Save money with DealPilot.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function CouponPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  /* =========================================================
     FETCH CURRENT COUPON
  ========================================================= */

  const { data: coupon, error: couponError } = await supabase
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
    .eq("slug", slug)
    .single();

  if (couponError) {
    console.error("Error fetching coupon:", couponError);
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!coupon) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="text-5xl">🏷️</div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Coupon not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This coupon may have expired or is no longer available.
          </p>

          <Link
            href="/coupons"
            className="
              mt-6
              inline-flex
              h-11
              items-center
              justify-center
              rounded-xl
              bg-emerald-500
              px-6
              text-sm
              font-black
              text-white
              shadow-sm
              transition
              hover:bg-emerald-400
            "
          >
            Browse All Coupons
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     STORE DATA
  ========================================================= */

  const storeName = coupon.stores?.name || coupon.store_name || "Store";

  const storeSlug =
    coupon.stores?.slug ||
    (coupon.store_name
      ? coupon.store_name.toLowerCase().replace(/\s+/g, "-")
      : "");

  const storeLogo = coupon.stores?.logo_url || null;

  /* =========================================================
     RELATED COUPONS
  ========================================================= */

  let relatedCoupons: any[] = [];

  if (coupon.store_id) {
    const { data } = await supabase
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
      .eq("store_id", coupon.store_id)
      .neq("id", coupon.id)
      .eq("status", "Active")
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(4);

    relatedCoupons = data || [];
  } else if (coupon.store_name) {
    const { data } = await supabase
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
      .eq("store_name", coupon.store_name)
      .neq("id", coupon.id)
      .eq("status", "Active")
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(4);

    relatedCoupons = data || [];
  }

  /* =========================================================
     STRUCTURED DATA
  ========================================================= */

  const siteUrl = "https://dealpilot.com";

  const couponUrl = `${siteUrl}/coupons/${coupon.slug}`;

  const storeUrl = storeSlug
    ? `${siteUrl}/stores/${storeSlug}`
    : `${siteUrl}/stores`;

  /* =========================================================
     BREADCRUMB SCHEMA
  ========================================================= */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Coupons",
        item: `${siteUrl}/coupons`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: storeName,
        item: storeUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: coupon.title,
        item: couponUrl,
      },
    ],
  };

  /* =========================================================
     WEBPAGE SCHEMA
  ========================================================= */

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: coupon.title,
    url: couponUrl,
    description: `${coupon.title} coupon and deal information from ${storeName}.`,
  };

  /* =========================================================
     FAQ SCHEMA
  ========================================================= */

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I use this coupon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Click GET CODE, copy the code, and enter it at checkout on ${storeName}.`,
        },
      },
      {
        "@type": "Question",
        name: "Is this coupon verified?",
        acceptedAnswer: {
          "@type": "Answer",
          text: coupon.verified
            ? "Yes. This coupon is marked as verified."
            : "This coupon has not been marked as verified.",
        },
      },
      {
        "@type": "Question",
        name: "When does this coupon expire?",
        acceptedAnswer: {
          "@type": "Answer",
          text: coupon.expires_at
            ? `This coupon expires on ${coupon.expires_at}.`
            : "An expiration date is not currently available.",
        },
      },
    ],
  };

  /* =========================================================
     PAGE UI
  ========================================================= */

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 lg:px-6">
      {/* =====================================================
          STRUCTURED DATA
      ===================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <nav
        aria-label="Breadcrumb"
        className="
          mb-6
          flex
          flex-wrap
          items-center
          gap-1.5
          text-xs
          font-medium
          text-slate-400
          sm:text-sm
        "
      >
        <Link href="/" className="transition-colors hover:text-emerald-600">
          Home
        </Link>

        <span>/</span>

        <Link
          href="/coupons"
          className="transition-colors hover:text-emerald-600"
        >
          Coupons
        </Link>

        <span>/</span>

        {storeSlug ? (
          <Link
            href={`/stores/${storeSlug}`}
            className="max-w-[180px] truncate transition-colors hover:text-emerald-600"
          >
            {storeName}
          </Link>
        ) : (
          <span className="max-w-[180px] truncate text-slate-500">
            {storeName}
          </span>
        )}

        <span>/</span>

        <span className="max-w-[220px] truncate text-slate-600">
          {coupon.title}
        </span>
      </nav>

      {/* =====================================================
          MAIN COUPON CARD
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_12px_40px_rgba(15,23,42,0.06)]
        "
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          {/* =================================================
              LEFT - PRODUCT / IMAGE
          ================================================= */}

          <div
            className="
              relative
              min-h-[300px]
              overflow-hidden
              border-b
              border-slate-100
              bg-slate-50
              sm:min-h-[400px]
              lg:min-h-[540px]
              lg:border-b-0
              lg:border-r
            "
          >
            {/* PRODUCT IMAGE */}

            {coupon.image_url ? (
              <Image
                src={coupon.image_url}
                alt={coupon.title || "Coupon deal"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="
                  object-contain
                  p-7
                  sm:p-10
                  lg:p-14
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  min-h-[300px]
                  items-center
                  justify-center
                  text-6xl
                  sm:min-h-[400px]
                "
              >
                🏷️
              </div>
            )}

            {/* SOFT BACKGROUND */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-br
                from-white/30
                via-transparent
                to-emerald-50/50
              "
            />

            {/* DISCOUNT BADGE */}

            {coupon.discount_value !== null &&
              coupon.discount_value !== undefined && (
                <div
                  className="
                    absolute
                    left-4
                    top-4
                    z-10
                    rounded-full
                    bg-rose-500
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    tracking-wide
                    text-white
                    shadow-lg
                    sm:left-5
                    sm:top-5
                  "
                >
                  -{coupon.discount_value}%
                </div>
              )}

            {/* FAVORITE */}

            <div
              className="
                absolute
                right-4
                top-4
                z-20
                sm:right-5
                sm:top-5
              "
            >
              <FavoriteButton couponId={String(coupon.id)} />
            </div>

            {/* VERIFIED */}

            {coupon.verified && (
              <div
                className="
                  absolute
                  bottom-4
                  left-4
                  z-10
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-100
                  bg-white/95
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-emerald-600
                  shadow-md
                  backdrop-blur
                  sm:bottom-5
                  sm:left-5
                "
              >
                <span
                  className="
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-100
                    text-[9px]
                    font-black
                  "
                >
                  ✓
                </span>
                Verified Deal
              </div>
            )}
          </div>

          {/* =================================================
              RIGHT - DEAL INFORMATION
          ================================================= */}

          <div
            className="
              flex
              flex-col
              p-5
              sm:p-7
              lg:p-9
            "
          >
            {/* STORE */}

            <div className="mb-5">
              {storeSlug ? (
                <Link
                  href={`/stores/${storeSlug}`}
                  className="
                    inline-flex
                    max-w-full
                    items-center
                    gap-2.5
                    rounded-xl
                    transition
                    hover:opacity-80
                  "
                >
                  {storeLogo ? (
                    <span
                      className="
                        relative
                        h-9
                        w-9
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                      "
                    >
                      <Image
                        src={storeLogo}
                        alt={storeName}
                        fill
                        sizes="36px"
                        className="object-contain p-1"
                      />
                    </span>
                  ) : (
                    <span
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-xs
                        font-black
                        text-slate-500
                      "
                    >
                      {storeName.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Store
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-slate-700">
                        {storeName}
                      </span>

                      {coupon.verified && (
                        <span
                          className="
                            flex
                            h-4
                            w-4
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-emerald-100
                            text-[9px]
                            font-black
                            text-emerald-600
                          "
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-100
                      text-xs
                      font-black
                      text-slate-500
                    "
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </span>

                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Store
                    </div>

                    <div className="text-sm font-bold text-slate-700">
                      {storeName}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DEAL LABEL */}

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {coupon.discount_value !== null &&
                coupon.discount_value !== undefined && (
                  <span
                    className="
                      rounded-full
                      bg-rose-50
                      px-3
                      py-1
                      text-xs
                      font-black
                      text-rose-600
                    "
                  >
                    {coupon.discount_value}% OFF
                  </span>
                )}

              {coupon.badge && (
                <span
                  className="
                    rounded-full
                    bg-cyan-50
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-cyan-700
                  "
                >
                  {coupon.badge}
                </span>
              )}
            </div>

            {/* TITLE */}

            <h1
              className="
                max-w-2xl
                text-2xl
                font-black
                leading-[1.15]
                tracking-tight
                text-slate-900
                sm:text-3xl
                lg:text-[38px]
              "
            >
              {coupon.title}
            </h1>

            {/* PRICE */}

            <div className="mt-6">
              {coupon.sale_price !== null && coupon.sale_price !== undefined ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span
                    className="
                      text-3xl
                      font-black
                      tracking-tight
                      text-slate-900
                      sm:text-4xl
                    "
                  >
                    ${Number(coupon.sale_price).toFixed(2)}
                  </span>

                  {coupon.original_price !== null &&
                    coupon.original_price !== undefined && (
                      <span
                        className="
                          text-base
                          font-medium
                          text-slate-400
                          line-through
                          sm:text-lg
                        "
                      >
                        ${Number(coupon.original_price).toFixed(2)}
                      </span>
                    )}
                </div>
              ) : (
                <span className="text-lg font-extrabold text-slate-700">
                  See deal price
                </span>
              )}
            </div>

            {/* COUPON CODE PREVIEW */}

            {coupon.coupon_code && (
              <div
                className="
                  mt-6
                  overflow-hidden
                  rounded-2xl
                  border
                  border-dashed
                  border-emerald-300
                  bg-emerald-50
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-4
                    py-3
                    sm:px-5
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-widest
                        text-emerald-600
                      "
                    >
                      Coupon Code
                    </div>

                    <div
                      className="
                        mt-1
                        text-xl
                        font-black
                        tracking-[0.14em]
                        text-slate-900
                        sm:text-2xl
                      "
                    >
                      {coupon.coupon_code.slice(0, 4)}••••
                    </div>
                  </div>

                  <div
                    className="
                      shrink-0
                      rounded-lg
                      bg-white
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-bold
                      text-emerald-600
                      shadow-sm
                    "
                  >
                    CODE
                  </div>
                </div>
              </div>
            )}

            {/* NO CODE */}

            {!coupon.coupon_code && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-4
                "
              >
                <div className="text-sm font-bold text-slate-700">
                  No coupon code required
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Continue to the store to claim this deal.
                </div>
              </div>
            )}

            {/* CTA */}

            <div className="mt-5">
              <GetCodeButton
                couponId={String(coupon.id)}
                couponCode={coupon.coupon_code}
                affiliateUrl={coupon.affiliate_url}
              />
            </div>

            {/* TRUST INFORMATION */}

            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-5
              "
            >
              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-5
                  gap-y-3
                  text-xs
                  sm:text-sm
                "
              >
                {coupon.verified && (
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-100
                        text-[10px]
                        font-black
                        text-emerald-600
                      "
                    >
                      ✓
                    </span>

                    <span className="font-semibold text-slate-600">
                      Verified
                    </span>
                  </div>
                )}

                {coupon.popularity_count !== null &&
                  coupon.popularity_count !== undefined &&
                  Number(coupon.popularity_count) > 0 && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>🔥</span>
                      <span>{coupon.popularity_count} clicks</span>
                    </div>
                  )}

                {coupon.rating !== null && coupon.rating !== undefined && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>⭐</span>

                    <span>
                      {Number(coupon.rating).toFixed(1)}
                      {coupon.review_count !== null &&
                        coupon.review_count !== undefined && (
                          <span className="ml-1 text-slate-400">
                            ({coupon.review_count})
                          </span>
                        )}
                    </span>
                  </div>
                )}

                {coupon.shipping_text && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>🚚</span>
                    <span>{coupon.shipping_text}</span>
                  </div>
                )}

                {coupon.sold_text && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>📦</span>
                    <span>{coupon.sold_text}</span>
                  </div>
                )}

                {coupon.expires_at && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>⏳</span>
                    <span>Expires: {coupon.expires_at}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SMALL TRUST MESSAGE */}

            <div
              className="
                mt-auto
                pt-6
                text-[11px]
                leading-5
                text-slate-400
              "
            >
              DealPilot helps you discover available deals and coupon codes from
              trusted stores.
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          HOW TO USE
      ===================================================== */}

      <section
        className="
          mt-8
          rounded-[24px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-10
          sm:p-7
          lg:p-8
        "
      >
        {/* SECTION HEADER */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className="
                mb-2
                inline-flex
                items-center
                rounded-full
                bg-emerald-50
                px-3
                py-1
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-emerald-600
              "
            >
              Easy to use
            </div>

            <h2
              className="
                text-xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-2xl
              "
            >
              How to use this coupon
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Follow these simple steps to save at checkout.
            </p>
          </div>
        </div>

        {/* STEPS */}

        <div
          className="
            mt-6
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
            lg:gap-4
          "
        >
          {/* STEP 1 */}

          <div
            className="
              relative
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              transition
              hover:border-emerald-100
              hover:bg-emerald-50/40
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-500
                text-sm
                font-black
                text-white
                shadow-sm
              "
            >
              01
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900">
              Get the code
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Click the GET CODE button above to reveal the available coupon.
            </p>
          </div>

          {/* STEP 2 */}

          <div
            className="
              relative
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              transition
              hover:border-emerald-100
              hover:bg-emerald-50/40
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-900
                text-sm
                font-black
                text-white
                shadow-sm
              "
            >
              02
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900">
              Copy the code
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Copy the coupon code so you can use it during checkout.
            </p>
          </div>

          {/* STEP 3 */}

          <div
            className="
              relative
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              transition
              hover:border-emerald-100
              hover:bg-emerald-50/40
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-orange-500
                text-sm
                font-black
                text-white
                shadow-sm
              "
            >
              03
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900">
              Visit {storeName}
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Continue to the store and add the eligible product to your cart.
            </p>
          </div>

          {/* STEP 4 */}

          <div
            className="
              relative
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              transition
              hover:border-emerald-100
              hover:bg-emerald-50/40
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-500
                text-sm
                font-black
                text-white
                shadow-sm
              "
            >
              04
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-900">
              Apply at checkout
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Enter the code at checkout and enjoy your available savings.
            </p>
          </div>
        </div>

        {/* TIP */}

        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-amber-100
            bg-amber-50
            px-4
            py-3.5
          "
        >
          <span
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white
              text-sm
              shadow-sm
            "
          >
            💡
          </span>

          <div>
            <p className="text-xs font-black text-slate-800">Helpful tip</p>

            <p className="mt-0.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
              Some coupons may have restrictions or minimum purchase
              requirements. Check the store&apos;s terms before completing your
              order.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          COUPON DETAILS
      ===================================================== */}

      <section
        className="
          mt-8
          rounded-[24px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-10
          sm:p-7
          lg:p-8
        "
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className="
                mb-2
                inline-flex
                items-center
                rounded-full
                bg-slate-100
                px-3
                py-1
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-slate-600
              "
            >
              Deal information
            </div>

            <h2
              className="
                text-xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-2xl
              "
            >
              Coupon details
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Everything you need to know before using this deal.
            </p>
          </div>

          {coupon.verified && (
            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-1.5
                text-[10px]
                font-black
                text-emerald-700
              "
            >
              <span
                className="
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  text-[9px]
                  text-white
                "
              >
                ✓
              </span>
              Verified deal
            </div>
          )}
        </div>

        <div
          className="
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-slate-100
          "
        >
          {/* Store */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-slate-100
              bg-slate-50/70
              px-4
              py-4
              sm:px-5
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                "
              >
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <span className="text-sm font-black text-slate-500">
                    {storeName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Store
                </p>

                <p className="truncate text-sm font-black text-slate-900">
                  {storeName}
                </p>
              </div>
            </div>

            {storeSlug && (
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  shrink-0
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-[10px]
                  font-extrabold
                  text-slate-600
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                View store
              </Link>
            )}
          </div>

          {/* Coupon type */}
          <div
            className="
              grid
              grid-cols-1
              divide-y
              divide-slate-100
              sm:grid-cols-2
              sm:divide-x
              sm:divide-y-0
            "
          >
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deal type
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {coupon.coupon_code ? "Coupon code" : "Automatic deal"}
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-extrabold
                  text-emerald-700
                "
              >
                {coupon.coupon_code ? "CODE" : "DEAL"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Savings
                </p>

                <p className="mt-1 text-sm font-black text-slate-900">
                  {coupon.discount_value !== null &&
                  coupon.discount_value !== undefined
                    ? `${coupon.discount_value}% off`
                    : "Special offer"}
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-orange-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-extrabold
                  text-orange-600
                "
              >
                SAVE
              </span>
            </div>
          </div>

          {/* Price */}
          {(coupon.sale_price || coupon.original_price) && (
            <div
              className="
                grid
                grid-cols-1
                divide-y
                divide-slate-100
                border-t
                border-slate-100
                sm:grid-cols-2
                sm:divide-x
                sm:divide-y-0
              "
            >
              <div className="px-4 py-4 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deal price
                </p>

                <p className="mt-1 text-lg font-black tracking-tight text-slate-900">
                  {coupon.sale_price
                    ? `$${Number(coupon.sale_price).toFixed(2)}`
                    : "See offer"}
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Original price
                </p>

                <p className="mt-1 text-sm font-bold text-slate-400 line-through">
                  {coupon.original_price
                    ? `$${Number(coupon.original_price).toFixed(2)}`
                    : "Not listed"}
                </p>
              </div>
            </div>
          )}

          {/* Status */}
          <div
            className="
              grid
              grid-cols-1
              divide-y
              divide-slate-100
              border-t
              border-slate-100
              sm:grid-cols-2
              sm:divide-x
              sm:divide-y-0
            "
          >
            <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-50
                  text-sm
                "
              >
                ✓
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Availability
                </p>

                <p className="mt-0.5 text-xs font-bold text-emerald-700">
                  Active deal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-sm
                "
              >
                🛡️
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trust
                </p>

                <p className="mt-0.5 text-xs font-bold text-slate-700">
                  {coupon.verified
                    ? "Verified by DealPilot"
                    : "Listed on DealPilot"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-slate-100
            bg-slate-50
            px-4
            py-3.5
          "
        >
          <span
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white
              text-sm
              shadow-sm
            "
          >
            ℹ️
          </span>

          <p className="text-[11px] leading-5 text-slate-500 sm:text-xs">
            Coupon availability, pricing and store terms can change at any time.
            Always review the final offer on the store&apos;s website before
            completing your purchase.
          </p>
        </div>
      </section>

      {/* =====================================================
          ABOUT THIS DEAL
      ===================================================== */}

      <section
        className="
          mt-8
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-10
        "
      >
        {/* HEADER */}

        <div
          className="
            border-b
            border-slate-100
            bg-gradient-to-r
            from-emerald-50
            via-white
            to-white
            px-5
            py-5
            sm:px-7
            sm:py-6
            lg:px-8
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-500
                text-lg
                text-white
                shadow-sm
              "
            >
              ✓
            </div>

            <div className="min-w-0">
              <div
                className="
                  mb-1.5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  text-emerald-600
                "
              >
                Deal overview
              </div>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                About this deal
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                A quick overview of this offer before you shop.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
            Save with this deal from{" "}
            <strong className="font-bold text-slate-900">{storeName}</strong>.
            This offer is available through DealPilot and may help you reduce
            the price of your eligible purchase.
          </p>

          {/* HIGHLIGHTS */}

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {/* SAVINGS */}

            <div
              className="
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-100
                    text-sm
                  "
                >
                  %
                </div>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Savings
                  </p>

                  <p className="mt-0.5 text-sm font-black text-slate-900">
                    {coupon.discount_value !== null &&
                    coupon.discount_value !== undefined
                      ? `${coupon.discount_value}% OFF`
                      : "Special offer"}
                  </p>
                </div>
              </div>
            </div>

            {/* STORE */}

            <div
              className="
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >
              <div className="flex items-center gap-3">
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
                    font-black
                    text-slate-500
                    shadow-sm
                  "
                >
                  {storeName.charAt(0).toUpperCase() || "S"}
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Store
                  </p>

                  <p className="mt-0.5 truncate text-sm font-black text-slate-900">
                    {storeName}
                  </p>
                </div>
              </div>
            </div>

            {/* VERIFICATION */}

            <div
              className="
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-100
                    text-sm
                    font-black
                    text-emerald-600
                  "
                >
                  ✓
                </div>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Verification
                  </p>

                  <p className="mt-0.5 text-sm font-black text-slate-900">
                    {coupon.verified ? "Verified deal" : "Deal listed"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION BOX */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-slate-100
              bg-white
              p-4
              sm:p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-black
                text-slate-900
              "
            >
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-sm
                "
              >
                🛍️
              </span>
              What to know
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-500 sm:text-sm">
              Coupon terms, product eligibility, minimum purchase requirements,
              shipping conditions and other restrictions may apply. Always
              review the final offer on the store&apos;s website before placing
              your order.
            </p>
          </div>

          {/* VERIFIED MESSAGE */}

          {coupon.verified && (
            <div
              className="
                mt-5
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50
                px-4
                py-3.5
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-sm
                  font-black
                  text-emerald-600
                  shadow-sm
                "
              >
                ✓
              </span>

              <div>
                <p className="text-xs font-black text-emerald-800">
                  DealPilot verified
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-emerald-700/75 sm:text-xs">
                  This deal is currently marked as verified in our coupon
                  database.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section
        className="
          mt-8
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-10
        "
      >
        {/* HEADER */}

        <div
          className="
            border-b
            border-slate-100
            bg-gradient-to-r
            from-slate-50
            via-white
            to-white
            px-5
            py-5
            sm:px-7
            sm:py-6
            lg:px-8
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-slate-900
                text-lg
                font-black
                text-white
                shadow-sm
              "
            >
              ?
            </div>

            <div className="min-w-0">
              <div
                className="
                  mb-1.5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  text-emerald-600
                "
              >
                Need to know
              </div>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                Frequently Asked Questions
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Common questions about this coupon and how to use it.
              </p>
            </div>
          </div>
        </div>

        {/* ACCORDION */}

        <div className="divide-y divide-slate-100">
          {/* QUESTION 1 */}

          <details
            className="
              group
              px-5
              sm:px-7
              lg:px-8
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-4
                py-5
                outline-none
                marker:hidden
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-xs
                    font-black
                    text-emerald-600
                  "
                >
                  01
                </span>

                <span className="text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                  How do I use this coupon?
                </span>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-lg
                  font-medium
                  leading-none
                  text-slate-500
                  transition-all
                  duration-200
                  group-open:rotate-45
                  group-open:border-emerald-200
                  group-open:bg-emerald-50
                  group-open:text-emerald-600
                "
              >
                +
              </span>
            </summary>

            <div className="pb-5 pl-11 pr-2 sm:pr-12">
              <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                Click the GET CODE button above, copy the coupon code, continue
                to{" "}
                <strong className="font-bold text-slate-800">
                  {storeName}
                </strong>
                , and enter the code during checkout.
              </p>
            </div>
          </details>

          {/* QUESTION 2 */}

          <details
            className="
              group
              px-5
              sm:px-7
              lg:px-8
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-4
                py-5
                outline-none
                marker:hidden
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-xs
                    font-black
                    text-slate-600
                  "
                >
                  02
                </span>

                <span className="text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                  Is this coupon verified?
                </span>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-lg
                  font-medium
                  leading-none
                  text-slate-500
                  transition-all
                  duration-200
                  group-open:rotate-45
                  group-open:border-emerald-200
                  group-open:bg-emerald-50
                  group-open:text-emerald-600
                "
              >
                +
              </span>
            </summary>

            <div className="pb-5 pl-11 pr-2 sm:pr-12">
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  px-4
                  py-3.5
                "
              >
                <div className="flex items-start gap-3">
                  <span
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-xs
                      font-black
                      text-emerald-600
                      shadow-sm
                    "
                  >
                    ✓
                  </span>

                  <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                    {coupon.verified
                      ? "Yes. This coupon is currently marked as verified by DealPilot."
                      : "This coupon is currently listed on DealPilot but has not been marked as verified."}
                  </p>
                </div>
              </div>
            </div>
          </details>

          {/* QUESTION 3 */}

          <details
            className="
              group
              px-5
              sm:px-7
              lg:px-8
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-4
                py-5
                outline-none
                marker:hidden
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-50
                    text-xs
                    font-black
                    text-orange-600
                  "
                >
                  03
                </span>

                <span className="text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                  When does this coupon expire?
                </span>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-lg
                  font-medium
                  leading-none
                  text-slate-500
                  transition-all
                  duration-200
                  group-open:rotate-45
                  group-open:border-emerald-200
                  group-open:bg-emerald-50
                  group-open:text-emerald-600
                "
              >
                +
              </span>
            </summary>

            <div className="pb-5 pl-11 pr-2 sm:pr-12">
              <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                {coupon.expires_at
                  ? `This coupon is currently listed with an expiration date of ${coupon.expires_at}.`
                  : "An expiration date is not currently available for this coupon. Check the store's terms before completing your purchase."}
              </p>
            </div>
          </details>

          {/* QUESTION 4 */}

          <details
            className="
              group
              px-5
              sm:px-7
              lg:px-8
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-4
                py-5
                outline-none
                marker:hidden
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-xs
                    font-black
                    text-emerald-600
                  "
                >
                  04
                </span>

                <span className="text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                  Does the coupon work on every product?
                </span>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-lg
                  font-medium
                  leading-none
                  text-slate-500
                  transition-all
                  duration-200
                  group-open:rotate-45
                  group-open:border-emerald-200
                  group-open:bg-emerald-50
                  group-open:text-emerald-600
                "
              >
                +
              </span>
            </summary>

            <div className="pb-5 pl-11 pr-2 sm:pr-12">
              <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                Not necessarily. Some coupons may only apply to selected
                products, categories, sellers or orders. Minimum purchase
                requirements and other exclusions may also apply.
              </p>
            </div>
          </details>

          {/* QUESTION 5 */}

          <details
            className="
              group
              px-5
              sm:px-7
              lg:px-8
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                gap-4
                py-5
                outline-none
                marker:hidden
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-xs
                    font-black
                    text-slate-600
                  "
                >
                  05
                </span>

                <span className="text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                  What should I do if the coupon does not work?
                </span>
              </div>

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-lg
                  font-medium
                  leading-none
                  text-slate-500
                  transition-all
                  duration-200
                  group-open:rotate-45
                  group-open:border-emerald-200
                  group-open:bg-emerald-50
                  group-open:text-emerald-600
                "
              >
                +
              </span>
            </summary>

            <div className="pb-5 pl-11 pr-2 sm:pr-12">
              <p className="text-xs leading-6 text-slate-500 sm:text-sm">
                Make sure the coupon has been entered correctly and that the
                order meets the store&apos;s conditions. Also check whether the
                offer has expired or has product restrictions. If the offer is
                no longer available, review the latest deals from{" "}
                <strong className="font-bold text-slate-800">
                  {storeName}
                </strong>
                .
              </p>
            </div>
          </details>
        </div>

        {/* BOTTOM NOTE */}

        <div
          className="
            border-t
            border-slate-100
            bg-slate-50/70
            px-5
            py-4
            sm:px-7
            lg:px-8
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-sm
                shadow-sm
              "
            >
              💡
            </span>

            <p className="text-[11px] leading-5 text-slate-500 sm:text-xs">
              Coupon terms can change at any time. Always confirm the final
              price, eligibility and store conditions before completing your
              purchase.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          RELATED COUPONS
      ===================================================== */}

      {relatedCoupons.length > 0 && (
        <section className="mt-10 sm:mt-12">
          {/* HEADER */}

          <div
            className="
              mb-5
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-2
                  inline-flex
                  items-center
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-1
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  text-emerald-600
                "
              >
                Keep shopping
              </div>

              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-2xl
                "
              >
                More coupons from {storeName}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                More deals from the same store that you may want to check out.
              </p>
            </div>

            {storeSlug && (
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-extrabold
                  text-slate-700
                  shadow-sm
                  transition-all
                  duration-200
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                  sm:text-sm
                "
              >
                View all coupons
                <span className="ml-1.5">→</span>
              </Link>
            )}
          </div>

          {/* COUPON GRID */}

          <div
            className="
              grid
              items-stretch
              gap-4
              sm:grid-cols-2
              sm:gap-5
              lg:grid-cols-4
            "
          >
            {relatedCoupons.map((item) => (
              <div
                key={item.id}
                className="
                  min-w-0
                  transition-transform
                  duration-200
                  hover:-translate-y-0.5
                "
              >
                <CouponCard coupon={item} />
              </div>
            ))}
          </div>

          {/* MOBILE STORE LINK */}

          {storeSlug && (
            <div className="mt-5 flex justify-center sm:hidden">
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-xs
                  font-extrabold
                  text-slate-700
                  shadow-sm
                  transition-all
                  duration-200
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                View All {storeName} Coupons
                <span className="ml-1.5">→</span>
              </Link>
            </div>
          )}

          {/* TRUST NOTE */}

          <div
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              px-4
              py-3.5
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white
                text-sm
                shadow-sm
              "
            >
              🔎
            </span>

            <div>
              <p className="text-[11px] font-black text-slate-800 sm:text-xs">
                Looking for more savings?
              </p>

              <p className="mt-0.5 text-[10px] leading-5 text-slate-500 sm:text-[11px]">
                Browse more active coupons from {storeName} and compare the
                available offers before choosing the best deal.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
