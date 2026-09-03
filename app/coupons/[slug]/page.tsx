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
          shadow-[0_10px_40px_rgba(15,23,42,0.07)]
        "
      >
        <div className="grid gap-0 md:grid-cols-2">
          {/* =================================================
              LEFT - IMAGE
          ================================================= */}

          <div
            className="
              relative
              min-h-[300px]
              bg-slate-50
              sm:min-h-[420px]
              md:min-h-[520px]
            "
          >
            {coupon.image_url ? (
              <Image
                src={coupon.image_url}
                alt={coupon.title || "Coupon deal"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6 sm:p-10"
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center text-6xl sm:min-h-[420px]">
                🏷️
              </div>
            )}

            {/* IMAGE OVERLAY */}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-100/10 via-transparent to-emerald-100/20" />

            {/* DISCOUNT */}

            {coupon.discount_value !== null &&
              coupon.discount_value !== undefined && (
                <span
                  className="
                    absolute
                    left-4
                    top-4
                    rounded-xl
                    bg-emerald-500
                    px-3
                    py-2
                    text-xs
                    font-black
                    tracking-wide
                    text-white
                    shadow-md
                    sm:left-5
                    sm:top-5
                  "
                >
                  {coupon.discount_value}% OFF
                </span>
              )}

            {/* VERIFIED */}

            {coupon.verified && (
              <span
                className="
                  absolute
                  bottom-4
                  left-4
                  rounded-full
                  border
                  border-emerald-100
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-emerald-600
                  shadow-md
                  sm:bottom-5
                  sm:left-5
                "
              >
                ✓ Verified Deal
              </span>
            )}

            {/* FAVORITE */}

            <div className="absolute right-4 top-4 z-20 sm:right-5 sm:top-5">
              <FavoriteButton couponId={String(coupon.id)} />
            </div>
          </div>

          {/* =================================================
              RIGHT - INFORMATION
          ================================================= */}

          <div className="flex flex-col p-5 sm:p-7 lg:p-9">
            {/* STORE */}

            <div className="mb-4">
              {storeSlug ? (
                <Link
                  href={`/stores/${storeSlug}`}
                  className="
                    inline-flex
                    max-w-full
                    items-center
                    gap-2.5
                    text-sm
                    font-bold
                    text-slate-600
                    transition-colors
                    hover:text-emerald-600
                  "
                >
                  {storeLogo ? (
                    <span
                      className="
                        relative
                        h-8
                        w-8
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                      "
                    >
                      <Image
                        src={storeLogo}
                        alt={storeName}
                        fill
                        sizes="32px"
                        className="object-contain p-1"
                      />
                    </span>
                  ) : (
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
                        text-xs
                        font-black
                        text-slate-500
                      "
                    >
                      S
                    </span>
                  )}

                  <span className="truncate">{storeName}</span>

                  {coupon.verified && (
                    <span
                      className="
                        flex
                        h-5
                        w-5
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
                  )}
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                    S
                  </span>

                  <span>{storeName}</span>
                </div>
              )}
            </div>

            {/* DISCOUNT */}

            {coupon.discount_value !== null &&
              coupon.discount_value !== undefined && (
                <div className="mb-2 text-sm font-black text-emerald-600">
                  {coupon.discount_value}% OFF
                </div>
              )}

            {/* TITLE */}

            <h1
              className="
                text-2xl
                font-black
                leading-tight
                tracking-tight
                text-slate-900
                sm:text-3xl
                lg:text-[36px]
              "
            >
              {coupon.title}
            </h1>

            {/* BADGE */}

            {coupon.badge && (
              <div className="mt-4 inline-flex w-fit rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                {coupon.badge}
              </div>
            )}

            {/* PRICE */}

            {coupon.sale_price !== null && coupon.sale_price !== undefined ? (
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  ${Number(coupon.sale_price).toFixed(2)}
                </span>

                {coupon.original_price !== null &&
                  coupon.original_price !== undefined && (
                    <span className="text-lg font-medium text-slate-400 line-through">
                      ${Number(coupon.original_price).toFixed(2)}
                    </span>
                  )}
              </div>
            ) : (
              <div className="mt-6 text-lg font-extrabold text-slate-700">
                See deal price
              </div>
            )}

            {/* COUPON CODE */}

            {coupon.coupon_code && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  p-4
                  sm:p-5
                "
              >
                <div className="text-xs font-semibold text-slate-500">
                  Coupon Code
                </div>

                <div
                  className="
                    mt-1
                    truncate
                    text-xl
                    font-black
                    tracking-[0.15em]
                    text-emerald-700
                    sm:text-2xl
                  "
                >
                  {coupon.coupon_code.slice(0, 4)}••••
                </div>
              </div>
            )}

            {/* GET CODE */}

            <div className="mt-5">
              <GetCodeButton
                couponId={String(coupon.id)}
                couponCode={coupon.coupon_code}
                affiliateUrl={coupon.affiliate_url}
              />
            </div>

            {/* TRUST / DETAILS */}

            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-5
                text-xs
                leading-5
                text-slate-500
                sm:text-sm
              "
            >
              {coupon.verified && (
                <div className="mb-2 flex items-center gap-2 font-bold text-emerald-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black">
                    ✓
                  </span>

                  <span>Verified Deal</span>
                </div>
              )}

              {coupon.popularity_count !== null &&
                coupon.popularity_count !== undefined &&
                Number(coupon.popularity_count) > 0 && (
                  <div className="mb-1">
                    🔥 {coupon.popularity_count} clicks
                  </div>
                )}

              {coupon.rating !== null && coupon.rating !== undefined && (
                <div className="mb-1">
                  ⭐ {Number(coupon.rating).toFixed(1)}
                  {coupon.review_count !== null &&
                    coupon.review_count !== undefined && (
                      <span className="ml-1 text-slate-400">
                        ({coupon.review_count} reviews)
                      </span>
                    )}
                </div>
              )}

              {coupon.shipping_text && (
                <div className="mb-1">🚚 {coupon.shipping_text}</div>
              )}

              {coupon.sold_text && (
                <div className="mb-1">📦 {coupon.sold_text}</div>
              )}

              {coupon.expires_at && (
                <div className="text-slate-400">
                  ⏳ Expires: {coupon.expires_at}
                </div>
              )}
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
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:mt-10
          sm:p-7
        "
      >
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          How to use this coupon
        </h2>

        <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600 sm:text-base">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
              1
            </span>

            <span>
              Click the <strong className="text-slate-900">GET CODE</strong>{" "}
              button.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
              2
            </span>

            <span>Copy the coupon code.</span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
              3
            </span>

            <span>
              Continue to{" "}
              <strong className="text-slate-900">{storeName}</strong>.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
              4
            </span>

            <span>Enter the code during checkout.</span>
          </li>
        </ol>
      </section>

      {/* =====================================================
          COUPON DETAILS
      ===================================================== */}

      <section
        className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Coupon Details
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {storeName && (
            <div>
              <p className="text-xs font-medium text-slate-400">Store</p>

              {storeSlug ? (
                <Link
                  href={`/stores/${storeSlug}`}
                  className="mt-1 block font-bold text-slate-900 hover:text-emerald-600"
                >
                  {storeName}
                </Link>
              ) : (
                <p className="mt-1 font-bold text-slate-900">{storeName}</p>
              )}
            </div>
          )}

          {coupon.category && (
            <div>
              <p className="text-xs font-medium text-slate-400">Category</p>

              <p className="mt-1 font-bold text-slate-900">{coupon.category}</p>
            </div>
          )}

          {coupon.discount_value !== null &&
            coupon.discount_value !== undefined && (
              <div>
                <p className="text-xs font-medium text-slate-400">Discount</p>

                <p className="mt-1 font-bold text-emerald-600">
                  {coupon.discount_value}% OFF
                </p>
              </div>
            )}

          {coupon.coupon_code && (
            <div>
              <p className="text-xs font-medium text-slate-400">Coupon Type</p>

              <p className="mt-1 font-bold text-slate-900">Promo Code</p>
            </div>
          )}

          {coupon.expires_at && (
            <div>
              <p className="text-xs font-medium text-slate-400">Expiration</p>

              <p className="mt-1 font-bold text-slate-900">
                {coupon.expires_at}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-400">Verification</p>

            <p
              className={`mt-1 font-bold ${
                coupon.verified ? "text-emerald-600" : "text-slate-600"
              }`}
            >
              {coupon.verified ? "Verified" : "Not verified"}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT THIS DEAL
      ===================================================== */}

      <section
        className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          About this deal
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Save with this deal from{" "}
          <strong className="font-bold text-slate-900">{storeName}</strong>.
          Check the offer details above and use the available coupon code at
          checkout to receive the advertised discount.
        </p>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section
        className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 divide-y divide-slate-100">
          <div className="py-5 first:pt-0">
            <h3 className="font-bold text-slate-900">
              How do I use this coupon?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Click GET CODE, copy the code, and enter it at checkout on{" "}
              {storeName}.
            </p>
          </div>

          <div className="py-5">
            <h3 className="font-bold text-slate-900">
              Is this coupon verified?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {coupon.verified
                ? "Yes. This coupon is marked as verified."
                : "This coupon has not been marked as verified."}
            </p>
          </div>

          <div className="py-5 last:pb-0">
            <h3 className="font-bold text-slate-900">
              When does this coupon expire?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {coupon.expires_at
                ? `This coupon expires on ${coupon.expires_at}.`
                : "An expiration date is not currently available."}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          RELATED COUPONS
      ===================================================== */}

      {relatedCoupons.length > 0 && (
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                More coupons from {storeName}
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                More deals you may want to check out.
              </p>
            </div>

            {storeSlug && (
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  hidden
                  shrink-0
                  text-sm
                  font-bold
                  text-emerald-600
                  hover:text-emerald-700
                  sm:block
                "
              >
                View Store →
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
            <div className="mt-5 text-center sm:hidden">
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
                  font-bold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-emerald-200
                  hover:text-emerald-600
                "
              >
                View All {storeName} Coupons →
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
