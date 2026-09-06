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
   SEO
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
   HELPERS
========================================================= */

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return `$${numberValue.toFixed(2)}`;
}

function formatExpires(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default async function CouponPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  /* =========================================================
     CURRENT COUPON
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
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div
          className="
            rounded-[24px]
            border
            border-slate-200
            bg-white
            px-6
            py-16
            text-center
            shadow-[0_10px_35px_rgba(15,23,42,0.06)]
          "
        >
          <div className="text-5xl">🏷️</div>

          <h1
            className="
              mt-5
              text-2xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
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
              hover:bg-emerald-600
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

  const salePrice = formatPrice(coupon.sale_price);

  const originalPrice = formatPrice(coupon.original_price);

  const expiresAt = formatExpires(coupon.expires_at);

  /* =========================================================
     RELATED COUPONS
  ========================================================= */

  let relatedCoupons: any[] = [];

  if (coupon.store_id) {
    const { data, error } = await supabase
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
      .order("popularity_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(4);

    if (error) {
      console.error("Error fetching related coupons:", error);
    }

    relatedCoupons = data || [];
  } else if (coupon.store_name) {
    const { data, error } = await supabase
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
      .order("popularity_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(4);

    if (error) {
      console.error("Error fetching related coupons:", error);
    }

    relatedCoupons = data || [];
  }

  /* =========================================================
     SEO URLS
  ========================================================= */

  const siteUrl = "https://dealpilot.com";

  const couponUrl = `${siteUrl}/coupons/${coupon.slug}`;

  const storeUrl = storeSlug
    ? `${siteUrl}/stores/${storeSlug}`
    : `${siteUrl}/stores`;

  /* =========================================================
     STRUCTURED DATA
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

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: coupon.title,
    url: couponUrl,
    description: `${coupon.title} coupon and deal information from ${storeName}.`,
  };

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

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        pb-16
        pt-6
        sm:px-6
        sm:pt-8
        lg:px-8
      "
    >
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
          mb-5
          flex
          flex-wrap
          items-center
          gap-1.5
          text-[11px]
          font-semibold
          text-slate-400
          sm:text-xs
        "
      >
        <Link href="/" className="transition hover:text-emerald-600">
          Home
        </Link>

        <span>/</span>

        <Link href="/coupons" className="transition hover:text-emerald-600">
          Coupons
        </Link>

        <span>/</span>

        {storeSlug ? (
          <Link
            href={`/stores/${storeSlug}`}
            className="
              max-w-[180px]
              truncate
              transition
              hover:text-emerald-600
            "
          >
            {storeName}
          </Link>
        ) : (
          <span
            className="
              max-w-[180px]
              truncate
              text-slate-500
            "
          >
            {storeName}
          </span>
        )}

        <span>/</span>

        <span
          className="
            max-w-[260px]
            truncate
            text-slate-600
          "
        >
          {coupon.title}
        </span>
      </nav>

      {/* =====================================================
          MAIN DEAL
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_12px_40px_rgba(15,23,42,0.07)]
        "
      >
        <div
          className="
            grid
            lg:grid-cols-[1fr_0.95fr]
          "
        >
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div
            className="
              relative
              min-h-[320px]
              overflow-hidden
              border-b
              border-slate-100
              bg-gradient-to-br
              from-slate-50
              via-white
              to-slate-100
              sm:min-h-[430px]
              lg:min-h-[510px]
              lg:border-b-0
              lg:border-r
            "
          >
            {/* Soft glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-56
                w-56
                rounded-full
                bg-emerald-100/40
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-20
                -left-20
                h-48
                w-48
                rounded-full
                bg-cyan-100/30
                blur-3xl
              "
            />

            {/* Image */}

            {coupon.image_url ? (
              <Image
                src={coupon.image_url}
                alt={coupon.title || "Coupon deal"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="
                  relative
                  z-[1]
                  object-contain
                  p-8
                  transition-transform
                  duration-500
                  hover:scale-[1.025]
                  sm:p-12
                  lg:p-14
                  xl:p-16
                "
              />
            ) : (
              <div
                className="
                  relative
                  z-[1]
                  flex
                  h-full
                  min-h-[320px]
                  items-center
                  justify-center
                  text-6xl
                  sm:min-h-[430px]
                "
              >
                🏷️
              </div>
            )}

            {/* Discount */}

            {coupon.discount_value !== null &&
              coupon.discount_value !== undefined && (
                <div
                  className="
                    absolute
                    left-4
                    top-4
                    z-10
                    rounded-full
                    bg-emerald-500
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    tracking-wide
                    text-white
                    shadow-[0_6px_18px_rgba(16,185,129,0.24)]
                    sm:left-5
                    sm:top-5
                  "
                >
                  {coupon.discount_value}% OFF
                </div>
              )}

            {/* Favorite */}

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

            {/* Verified */}

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
                  text-[11px]
                  font-black
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
                Verified deal
              </div>
            )}
          </div>

          {/* =================================================
              DEAL INFO
          ================================================= */}

          <div
            className="
              flex
              flex-col
              p-5
              sm:p-7
              lg:p-8
              xl:p-9
            "
          >
            {/* STORE */}

            {storeSlug ? (
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  group/store
                  mb-5
                  flex
                  w-fit
                  max-w-full
                  items-center
                  gap-2.5
                  rounded-xl
                  p-1
                  transition
                  hover:bg-slate-50
                "
              >
                <span
                  className="
                    relative
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
                    shadow-sm
                  "
                >
                  {storeLogo ? (
                    <Image
                      src={storeLogo}
                      alt={storeName}
                      fill
                      sizes="40px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-sm font-black text-slate-500">
                      {storeName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Store
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span
                      className="
                        max-w-[180px]
                        truncate
                        text-sm
                        font-extrabold
                        text-slate-800
                        group-hover/store:text-emerald-700
                      "
                    >
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
                  </span>
                </span>
              </Link>
            ) : (
              <div className="mb-5 flex items-center gap-2.5">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-sm
                    font-black
                    text-slate-500
                  "
                >
                  {storeName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Store
                  </div>

                  <div className="text-sm font-extrabold text-slate-800">
                    {storeName}
                  </div>
                </div>
              </div>
            )}

            {/* BADGES */}

            <div
              className="
                mb-3
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              {coupon.discount_value !== null &&
                coupon.discount_value !== undefined && (
                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1
                      text-[10px]
                      font-black
                      text-emerald-700
                      ring-1
                      ring-inset
                      ring-emerald-100
                    "
                  >
                    {coupon.discount_value}% OFF
                  </span>
                )}

              {coupon.coupon_code && (
                <span
                  className="
                    rounded-full
                    bg-orange-50
                    px-3
                    py-1
                    text-[10px]
                    font-black
                    text-orange-600
                    ring-1
                    ring-inset
                    ring-orange-100
                  "
                >
                  COUPON
                </span>
              )}

              {coupon.badge && (
                <span
                  className="
                    max-w-[180px]
                    truncate
                    rounded-full
                    bg-cyan-50
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    text-cyan-700
                    ring-1
                    ring-inset
                    ring-cyan-100
                  "
                >
                  {coupon.badge}
                </span>
              )}
            </div>

            {/* TITLE */}

            <h1
              className="
                text-[25px]
                font-black
                leading-[1.16]
                tracking-[-0.025em]
                text-slate-950
                sm:text-3xl
                lg:text-[35px]
              "
            >
              {coupon.title}
            </h1>

            {/* PRICE */}

            <div className="mt-5">
              {salePrice ? (
                <div className="flex flex-wrap items-end gap-3">
                  <span
                    className="
                      text-[32px]
                      font-black
                      leading-none
                      tracking-[-0.03em]
                      text-slate-950
                      sm:text-[38px]
                    "
                  >
                    {salePrice}
                  </span>

                  {originalPrice && (
                    <span
                      className="
                        pb-1
                        text-sm
                        font-medium
                        text-slate-400
                        line-through
                        sm:text-base
                      "
                    >
                      {originalPrice}
                    </span>
                  )}
                </div>
              ) : (
                <span
                  className="
                    text-xl
                    font-black
                    text-slate-800
                  "
                >
                  See deal
                </span>
              )}

              {coupon.discount_value !== null &&
                coupon.discount_value !== undefined &&
                salePrice &&
                originalPrice && (
                  <div className="mt-2">
                    <span
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-emerald-600
                      "
                    >
                      Save {coupon.discount_value}%
                    </span>
                  </div>
                )}
            </div>

            {/* CODE PREVIEW */}

            {coupon.coupon_code ? (
              <div
                className="
                  mt-5
                  overflow-hidden
                  rounded-[18px]
                  border
                  border-dashed
                  border-emerald-300
                  bg-emerald-50/70
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-4
                    py-3.5
                    sm:px-5
                  "
                >
                  <div className="min-w-0">
                    <div
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-emerald-600
                      "
                    >
                      Coupon code
                    </div>

                    <div
                      className="
                        mt-1
                        truncate
                        font-mono
                        text-[18px]
                        font-black
                        tracking-[0.18em]
                        text-slate-900
                        sm:text-xl
                      "
                    >
                      {coupon.coupon_code.slice(0, 4)}
                      ••••
                    </div>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-lg
                      bg-white
                      px-2.5
                      py-1.5
                      text-[9px]
                      font-black
                      tracking-wider
                      text-emerald-600
                      shadow-sm
                    "
                  >
                    CODE
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="
                  mt-5
                  rounded-[18px]
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-4
                "
              >
                <div className="text-sm font-black text-slate-800">
                  No coupon code required
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Continue to {storeName} to claim this deal.
                </p>
              </div>
            )}

            {/* CTA */}

            <div className="mt-4">
              <GetCodeButton
                couponId={String(coupon.id)}
                couponCode={coupon.coupon_code}
                affiliateUrl={coupon.affiliate_url}
              />
            </div>

            {/* TRUST */}

            <div
              className="
                mt-5
                border-t
                border-slate-100
                pt-4
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-4
                  gap-y-2
                  text-[10px]
                  font-semibold
                  text-slate-500
                  sm:text-[11px]
                "
              >
                {coupon.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-black">
                      ✓
                    </span>
                    Verified
                  </span>
                )}

                {coupon.rating !== null && coupon.rating !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-amber-400">★</span>

                    <span className="font-bold text-slate-700">
                      {Number(coupon.rating).toFixed(1)}
                    </span>

                    {coupon.review_count !== null &&
                      coupon.review_count !== undefined && (
                        <span className="text-slate-400">
                          ({coupon.review_count})
                        </span>
                      )}
                  </span>
                )}

                {coupon.popularity_count !== null &&
                  coupon.popularity_count !== undefined &&
                  Number(coupon.popularity_count) > 0 && (
                    <span>🔥 {coupon.popularity_count} clicks</span>
                  )}
              </div>

              {expiresAt && (
                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  <span>⏳</span>
                  Expires {expiresAt}
                </div>
              )}
            </div>

            {/* TRUST MESSAGE */}

            <div
              className="
                mt-auto
                pt-5
                text-[10px]
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
          mt-7
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-9
        "
      >
        <div
          className="
            border-b
            border-slate-100
            bg-gradient-to-r
            from-emerald-50/70
            via-white
            to-white
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
        >
          <div
            className="
              inline-flex
              rounded-full
              bg-emerald-50
              px-3
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-emerald-600
            "
          >
            Easy to use
          </div>

          <h2
            className="
              mt-2
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

        <div
          className="
            grid
            gap-3
            p-5
            sm:grid-cols-2
            sm:p-7
            lg:grid-cols-4
          "
        >
          {[
            {
              number: "01",
              title: "Get the code",
              text: "Click the GET CODE button above to reveal the available coupon.",
              icon: "%",
              style: "bg-emerald-500 text-white",
            },
            {
              number: "02",
              title: "Copy the code",
              text: "Copy the coupon code so you can use it during checkout.",
              icon: "↗",
              style: "bg-slate-900 text-white",
            },
            {
              number: "03",
              title: `Visit ${storeName}`,
              text: "Continue to the store and add the eligible product to your cart.",
              icon: "→",
              style: "bg-orange-500 text-white",
            },
            {
              number: "04",
              title: "Apply at checkout",
              text: "Enter the code at checkout and enjoy your available savings.",
              icon: "✓",
              style: "bg-emerald-500 text-white",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="
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
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-xs
                  font-black
                  shadow-sm
                  ${step.style}
                `}
              >
                {step.number}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-xs
                    font-black
                    text-slate-700
                    shadow-sm
                  "
                >
                  {step.icon}
                </span>

                <h3 className="text-sm font-black text-slate-900">
                  {step.title}
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="
            mx-5
            mb-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-amber-100
            bg-amber-50
            px-4
            py-3.5
            sm:mx-7
            sm:mb-7
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
          mt-7
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-9
        "
      >
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="
              inline-flex
              rounded-full
              bg-slate-100
              px-3
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-600
            "
          >
            Deal information
          </div>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
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
                Coupon details
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Everything you need to know before using this deal.
              </p>
            </div>

            {coupon.verified && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-black
                  text-emerald-700
                "
              >
                ✓ Verified deal
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100">
          {/* STORE */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-slate-100
              bg-slate-50/70
              px-5
              py-4
              sm:px-7
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
                    className="
                      h-full
                      w-full
                      object-contain
                      p-1.5
                    "
                  />
                ) : (
                  <span className="text-sm font-black text-slate-500">
                    {storeName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
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
                  shadow-sm
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

          {/* DEAL TYPE + SAVINGS */}

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
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                px-5
                py-4
                sm:px-7
              "
            >
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
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
                  text-[9px]
                  font-black
                  text-emerald-700
                "
              >
                {coupon.coupon_code ? "CODE" : "DEAL"}
              </span>
            </div>

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                px-5
                py-4
                sm:px-7
              "
            >
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
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
                  text-[9px]
                  font-black
                  text-orange-600
                "
              >
                SAVE
              </span>
            </div>
          </div>

          {/* PRICE */}

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
              <div className="px-5 py-4 sm:px-7">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Deal price
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  {salePrice || "See offer"}
                </p>
              </div>

              <div className="px-5 py-4 sm:px-7">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Original price
                </p>

                <p className="mt-1 text-sm font-bold text-slate-400 line-through">
                  {originalPrice || "Not listed"}
                </p>
              </div>
            </div>
          )}

          {/* STATUS */}

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
            <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
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
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Availability
                </p>

                <p className="mt-0.5 text-xs font-black text-emerald-700">
                  Active deal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
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
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Trust
                </p>

                <p className="mt-0.5 text-xs font-black text-slate-700">
                  {coupon.verified
                    ? "Verified by DealPilot"
                    : "Listed on DealPilot"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-start
            gap-3
            border-t
            border-slate-100
            bg-slate-50/70
            px-5
            py-4
            sm:px-7
          "
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
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
          mt-7
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-9
        "
      >
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
                font-black
                text-white
                shadow-sm
              "
            >
              ✓
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Deal overview
              </div>

              <h2
                className="
                  mt-1.5
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

        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
            Save with this deal from{" "}
            <strong className="font-bold text-slate-900">{storeName}</strong>.
            This offer is available through DealPilot and may help you reduce
            the price of your eligible purchase.
          </p>

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black">
                  %
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
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

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-500 shadow-sm">
                  {storeName.charAt(0).toUpperCase() || "S"}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Store
                  </p>

                  <p className="mt-0.5 truncate text-sm font-black text-slate-900">
                    {storeName}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Verification
                  </p>

                  <p className="mt-0.5 text-sm font-black text-slate-900">
                    {coupon.verified ? "Verified deal" : "Deal listed"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              sm:p-5
            "
          >
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-sm
                  shadow-sm
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
          mt-7
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          sm:mt-9
        "
      >
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
              "
            >
              ?
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Need to know
              </div>

              <h2
                className="
                  mt-1.5
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

        <div className="divide-y divide-slate-100">
          {[
            {
              number: "01",
              question: "How do I use this coupon?",
              color: "bg-emerald-50 text-emerald-600",
              answer: (
                <>
                  Click the GET CODE button above, copy the coupon code,
                  continue to{" "}
                  <strong className="font-bold text-slate-800">
                    {storeName}
                  </strong>
                  , and enter the code during checkout.
                </>
              ),
            },
            {
              number: "02",
              question: "Is this coupon verified?",
              color: "bg-slate-100 text-slate-600",
              answer: coupon.verified
                ? "Yes. This coupon is currently marked as verified by DealPilot."
                : "This coupon is currently listed on DealPilot but has not been marked as verified.",
            },
            {
              number: "03",
              question: "When does this coupon expire?",
              color: "bg-orange-50 text-orange-600",
              answer: coupon.expires_at
                ? `This coupon is currently listed with an expiration date of ${coupon.expires_at}.`
                : "An expiration date is not currently available for this coupon.",
            },
            {
              number: "04",
              question: "Does the coupon work on every product?",
              color: "bg-emerald-50 text-emerald-600",
              answer:
                "Not necessarily. Some coupons may only apply to selected products, categories, sellers or orders. Minimum purchase requirements and other exclusions may also apply.",
            },
            {
              number: "05",
              question: "What should I do if the coupon does not work?",
              color: "bg-slate-100 text-slate-600",
              answer: (
                <>
                  Make sure the coupon has been entered correctly and that the
                  order meets the store&apos;s conditions. Also check whether
                  the offer has expired or has product restrictions.
                </>
              ),
            },
          ].map((item) => (
            <details key={item.number} className="group px-5 sm:px-7">
              <summary
                className="
                  flex
                  cursor-pointer
                  list-none
                  items-center
                  justify-between
                  gap-4
                  py-4.5
                  outline-none
                  marker:hidden
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-[10px]
                      font-black
                      ${item.color}
                    `}
                  >
                    {item.number}
                  </span>

                  <span
                    className="
                      text-sm
                      font-black
                      leading-5
                      text-slate-900
                      sm:text-[15px]
                    "
                  >
                    {item.question}
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
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div
          className="
            border-t
            border-slate-100
            bg-slate-50/70
            px-5
            py-4
            sm:px-7
          "
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
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
        <section className="mt-9 sm:mt-11">
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
            <div className="min-w-0">
              <div
                className="
                  inline-flex
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-1
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-emerald-600
                "
              >
                Keep shopping
              </div>

              <h2
                className="
                  mt-2
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
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-extrabold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                View all coupons
                <span className="ml-1.5">→</span>
              </Link>
            )}
          </div>

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
              <div key={item.id} className="min-w-0">
                <CouponCard coupon={item} />
              </div>
            ))}
          </div>

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
                  transition
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
