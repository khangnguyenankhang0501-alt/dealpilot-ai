import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CouponCard from "@/components/CouponCard";
import CouponDetailActions from "@/components/CouponDetailActions";
import FavoriteButton from "@/components/FavoriteButton";
import { supabase } from "@/lib/supabaseClient";

interface CouponDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
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

function formatDiscount(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return `${numberValue}% OFF`;
}

function formatClicks(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  if (numberValue >= 1000000) {
    return `${(numberValue / 1000000).toFixed(1).replace(".0", "")}M`;
  }

  if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return String(numberValue);
}

function formatReviewCount(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return String(numberValue);
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: CouponDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("title, store_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!coupon) {
    return {
      title: "Deal not found | DealPilot",
    };
  }

  return {
    title: `${coupon.title || "Deal"} | DealPilot`,
    description: `Find the latest price, discount and coupon information for ${
      coupon.title || "this deal"
    }.`,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function CouponDetailPage({
  params,
}: CouponDetailPageProps) {
  const { slug } = await params;

  /* =======================================================
     GET COUPON
  ======================================================= */

  const { data: coupon, error } = await supabase
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
    .maybeSingle();

  if (error) {
    console.error("Error fetching coupon detail:", error);
  }

  if (!coupon) {
    notFound();
  }

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const storeName = coupon.stores?.name || coupon.store_name || "Store";

  const storeSlug = coupon.stores?.slug || "";

  const storeLogo = coupon.stores?.logo_url || "";

  const storeInitial = storeName.trim().charAt(0).toUpperCase() || "S";

  const discount = formatDiscount(coupon.discount_value);

  const salePrice = formatPrice(coupon.sale_price);

  const originalPrice = formatPrice(coupon.original_price);

  const clicks = formatClicks(coupon.popularity_count);

  const reviewCount = formatReviewCount(coupon.review_count);

  /* =======================================================
     SIMILAR DEALS
  ======================================================= */

  const { data: similarCoupons, error: similarError } = await supabase
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
    .neq("id", coupon.id)
    .order("popularity_count", {
      ascending: false,
      nullsFirst: false,
    })
    .order("click_count", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(5);

  if (similarError) {
    console.error("Error fetching similar coupons:", similarError);
  }

  const relatedCoupons = similarCoupons ?? [];

  return (
    <main className="min-h-screen bg-slate-50/40">
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          pb-10
          pt-4
          sm:px-6
          sm:pb-12
          sm:pt-5
          lg:px-8
        "
      >
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <nav
          className="
            mb-4
            flex
            items-center
            gap-2
            overflow-hidden
            whitespace-nowrap
            text-[10px]
            font-medium
            text-slate-400
            sm:text-[11px]
          "
        >
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>

          <span className="text-slate-300">/</span>

          <Link href="/coupons" className="hover:text-emerald-600">
            Coupons
          </Link>

          <span className="text-slate-300">/</span>

          <span className="truncate text-slate-500">{storeName}</span>
        </nav>

        {/* =================================================
            MAIN DEAL
        ================================================= */}

        <section
          className="
            grid
            overflow-hidden
            rounded-[20px]
            border
            border-slate-200
            bg-white
            shadow-[0_5px_20px_rgba(15,23,42,0.035)]
            lg:grid-cols-[1.02fr_0.98fr]
          "
        >
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div
            className="
              relative
              min-h-[300px]
              overflow-hidden
              border-b
              border-slate-100
              bg-slate-50
              sm:min-h-[370px]
              lg:min-h-[430px]
              lg:border-b-0
              lg:border-r
            "
          >
            <div
              className="
                absolute
                inset-3
                overflow-hidden
                rounded-[16px]
                bg-white
                sm:inset-4
              "
            >
              {coupon.image_url ? (
                <Image
                  src={coupon.image_url}
                  alt={coupon.title || "Deal product"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="
                    object-contain
                    p-4
                    sm:p-6
                    lg:p-7
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      flex
                      h-28
                      w-28
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-50
                      text-4xl
                      font-black
                      text-slate-300
                    "
                  >
                    {storeInitial}
                  </div>
                </div>
              )}
            </div>

            {/* DISCOUNT */}

            {discount && (
              <span
                className="
                  absolute
                  left-5
                  top-5
                  z-20
                  rounded-full
                  bg-emerald-500
                  px-3
                  py-1.5
                  text-[11px]
                  font-black
                  text-white
                  shadow-[0_7px_16px_rgba(16,185,129,0.2)]
                "
              >
                {discount}
              </span>
            )}

            {/* FAVORITE */}

            <div
              className="
                absolute
                right-5
                top-5
                z-30
              "
            >
              <FavoriteButton couponId={String(coupon.id)} />
            </div>
          </div>

          {/* =================================================
              DEAL INFO
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              flex-col
              p-5
              sm:p-6
              lg:p-7
            "
          >
            {/* STORE */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-2.5
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-lg
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
                      p-1
                    "
                  />
                ) : (
                  <span
                    className="
                      text-[11px]
                      font-black
                      text-slate-500
                    "
                  >
                    {storeInitial}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    truncate
                    text-xs
                    font-black
                    text-slate-900
                  "
                >
                  {storeName}
                </div>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1
                    text-[9px]
                    font-bold
                    text-emerald-600
                  "
                >
                  <span>✓</span>

                  {coupon.verified ? "Verified deal" : "DealPilot deal"}
                </div>
              </div>
            </div>

            {/* TITLE */}

            <h1
              className="
                mt-4
                line-clamp-3
                max-w-[620px]
                text-[21px]
                font-black
                leading-[1.16]
                tracking-[-0.025em]
                text-slate-950
                sm:text-[25px]
                lg:text-[28px]
              "
            >
              {coupon.title || "Special Deal"}
            </h1>

            {/* PRICE */}

            <div
              className="
                mt-4
                flex
                items-end
                gap-2.5
              "
            >
              {salePrice ? (
                <span
                  className="
                    text-[30px]
                    font-black
                    leading-none
                    tracking-[-0.04em]
                    text-slate-950
                    sm:text-[34px]
                  "
                >
                  {salePrice}
                </span>
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

              {originalPrice && (
                <span
                  className="
                    pb-0.5
                    text-xs
                    font-semibold
                    text-slate-400
                    line-through
                    sm:text-sm
                  "
                >
                  {originalPrice}
                </span>
              )}
            </div>

            {/* TAGS */}

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-1.5
              "
            >
              {discount && (
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
                  {discount}
                </span>
              )}

              {coupon.badge && (
                <span
                  className="
                    rounded-full
                    bg-cyan-50
                    px-2.5
                    py-1
                    text-[9px]
                    font-black
                    text-cyan-700
                  "
                >
                  {coupon.badge}
                </span>
              )}

              {coupon.coupon_code && (
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
                  Promo Code
                </span>
              )}
            </div>

            {/* META */}

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2.5
                text-[10px]
                font-semibold
                text-slate-400
              "
            >
              {coupon.rating !== null && coupon.rating !== undefined && (
                <span
                  className="
                      inline-flex
                      items-center
                      gap-1
                    "
                >
                  <span className="text-amber-400">★</span>

                  <span className="font-black text-slate-700">
                    {Number(coupon.rating).toFixed(1)}
                  </span>

                  {reviewCount && <span>({reviewCount})</span>}
                </span>
              )}

              {clicks && (
                <>
                  <span className="text-slate-200">|</span>

                  <span>🔥 {clicks} clicks</span>
                </>
              )}

              {coupon.sold_text && (
                <>
                  <span className="text-slate-200">|</span>

                  <span className="truncate">{coupon.sold_text}</span>
                </>
              )}
            </div>

            {/* DIVIDER */}

            <div
              className="
                my-4
                border-t
                border-slate-100
              "
            />

            {/* COUPON ACTION */}

            <CouponDetailActions
              couponCode={coupon.coupon_code}
              affiliateUrl={coupon.affiliate_url}
              storeName={storeName}
            />

            {/* SHIPPING */}

            {coupon.shipping_text && (
              <div
                className="
                  mt-3
                  text-center
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                🚚 {coupon.shipping_text}
              </div>
            )}

            {/* STORE */}

            {storeSlug && (
              <Link
                href={`/stores/${storeSlug}`}
                className="
                  mt-3
                  text-center
                  text-[10px]
                  font-bold
                  text-slate-400
                  transition
                  hover:text-emerald-600
                "
              >
                More deals from {storeName} →
              </Link>
            )}
          </div>
        </section>

        {/* =================================================
            SIMILAR DEALS
        ================================================= */}

        {relatedCoupons.length > 0 && (
          <section className="mt-7">
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <h2
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                Similar Deals
              </h2>

              <Link
                href="/coupons"
                className="
                  text-[10px]
                  font-black
                  text-emerald-600
                  sm:text-[11px]
                "
              >
                View all →
              </Link>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-5
                lg:gap-4
              "
            >
              {relatedCoupons.map((relatedCoupon) => (
                <CouponCard key={relatedCoupon.id} coupon={relatedCoupon} />
              ))}
            </div>
          </section>
        )}

        {/* =================================================
            DISCLOSURE
        ================================================= */}

        <p
          className="
            mt-6
            text-center
            text-[9px]
            font-medium
            leading-4
            text-slate-400
          "
        >
          DealPilot may earn a commission from qualifying purchases.
        </p>
      </div>
    </main>
  );
}
