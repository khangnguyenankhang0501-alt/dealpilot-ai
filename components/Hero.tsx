"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroCoupon = {
  id: string;
  title?: string | null;
  slug?: string | null;

  expires_at?: string | null;

  image_url?: string | null;

  discount_value?: number | string | null;

  original_price?: number | string | null;

  sale_price?: number | string | null;

  store_name?: string | null;
  store_logo_url?: string | null;

  rating?: number | string | null;
  review_count?: number | string | null;

  popularity_count?: number | string | null;
  click_count?: number | string | null;

  verified?: boolean | null;

  featured?: boolean | null;
  is_featured?: boolean | null;

  status?: string | null;

  stores?: {
    id?: string | null;
    name?: string | null;
    logo_url?: string | null;
  } | null;
};

type HeroStats = {
  dealsTracked: number;
  newDeals: number;
  verifiedPercentage: number;
};

type HeroProps = {
  coupons?: HeroCoupon[];
  stats?: HeroStats;
};

const DEFAULT_STATS: HeroStats = {
  dealsTracked: 0,
  newDeals: 0,
  verifiedPercentage: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value?: number | string | null) {
  if (value == null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return `$${numberValue.toFixed(2)}`;
}

function getDiscountNumber(value?: number | string | null) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function formatDiscount(value?: number | string | null) {
  const numberValue = getDiscountNumber(value);

  if (numberValue <= 0) {
    return "DEAL";
  }

  return `${numberValue}% OFF`;
}

function getStoreName(coupon: HeroCoupon) {
  return coupon.store_name || coupon.stores?.name || "Store";
}

function getStoreLogo(coupon: HeroCoupon) {
  return coupon.store_logo_url || coupon.stores?.logo_url || null;
}

function getCouponHref(coupon: HeroCoupon) {
  return coupon.slug ? `/coupons/${coupon.slug}` : "/deals";
}

/* =========================================================
   HERO SCORE
========================================================= */

function getHeroScore(coupon: HeroCoupon) {
  const discount = getDiscountNumber(coupon.discount_value);

  const rating = Number(coupon.rating) || 0;

  const reviews = Number(coupon.review_count) || 0;

  const popularity = Number(coupon.popularity_count) || 0;

  const clicks = Number(coupon.click_count) || 0;

  const hasImage = coupon.image_url ? 1 : 0;

  const hasPrice = coupon.sale_price != null ? 1 : 0;

  const verified = coupon.verified === true ? 1 : 0;

  const featured =
    coupon.featured === true || coupon.is_featured === true ? 1 : 0;

  let expirationScore = 0;

  if (coupon.expires_at) {
    const expires = new Date(coupon.expires_at).getTime();

    if (Number.isFinite(expires)) {
      const hoursLeft = (expires - Date.now()) / (1000 * 60 * 60);

      if (hoursLeft > 0 && hoursLeft <= 24) {
        expirationScore = 25;
      } else if (hoursLeft > 24 && hoursLeft <= 72) {
        expirationScore = 15;
      } else if (hoursLeft > 72) {
        expirationScore = 5;
      }
    }
  }

  return (
    discount * 3 +
    rating * 5 +
    Math.min(reviews / 100, 20) +
    Math.min(popularity / 100, 20) +
    Math.min(clicks / 50, 15) +
    verified * 20 +
    featured * 15 +
    hasImage * 10 +
    hasPrice * 5 +
    expirationScore
  );
}

/* =========================================================
   COUNTDOWN
========================================================= */

function Countdown({ expiresAt }: { expiresAt?: string | null }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const calculateSeconds = () => {
      if (!expiresAt) {
        return 0;
      }

      const expiresTime = new Date(expiresAt).getTime();

      if (!Number.isFinite(expiresTime)) {
        return 0;
      }

      return Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
    };

    setSecondsLeft(calculateSeconds());

    const timer = window.setInterval(() => {
      setSecondsLeft(calculateSeconds());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [expiresAt]);

  if (!expiresAt || secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />

        <span>Deal ending soon</span>
      </div>
    );
  }

  const hours = Math.floor(secondsLeft / 3600);

  const minutes = Math.floor((secondsLeft % 3600) / 60);

  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        Ends in
      </span>

      <span className="rounded-md bg-slate-900 px-1.5 py-1 text-[9px] font-black tabular-nums text-white">
        {String(hours).padStart(2, "0")}
      </span>

      <span className="text-[9px] font-black text-slate-300">:</span>

      <span className="rounded-md bg-slate-900 px-1.5 py-1 text-[9px] font-black tabular-nums text-white">
        {String(minutes).padStart(2, "0")}
      </span>

      <span className="text-[9px] font-black text-slate-300">:</span>

      <span className="rounded-md bg-emerald-500 px-1.5 py-1 text-[9px] font-black tabular-nums text-white">
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN SHOWCASE CARD
========================================================= */

function MainDealCard({ product }: { product: HeroCoupon }) {
  const discount = formatDiscount(product.discount_value);

  const salePrice = formatPrice(product.sale_price) || "See deal";

  const originalPrice = formatPrice(product.original_price);

  const storeName = getStoreName(product);

  const storeLogo = getStoreLogo(product);

  return (
    <Link
      href={getCouponHref(product)}
      className="
        group
        absolute
        left-1/2
        top-1/2
        z-30
        w-[255px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-[24px]
        border
        border-slate-100
        bg-white
        p-3.5
        shadow-[0_25px_65px_rgba(15,23,42,0.16)]
        transition-all
        duration-300
        hover:-translate-x-1/2
        hover:-translate-y-[52%]
        hover:shadow-[0_32px_80px_rgba(15,23,42,0.20)]
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          h-[190px]
          overflow-hidden
          rounded-[18px]
          bg-gradient-to-br
          from-slate-50
          via-white
          to-emerald-50
        "
      >
        {/* Discount */}

        <span
          className="
            absolute
            left-3
            top-3
            z-20
            rounded-full
            bg-emerald-500
            px-2.5
            py-1
            text-[9px]
            font-black
            tracking-wide
            text-white
            shadow-sm
          "
        >
          {discount}
        </span>

        {/* Verified */}

        {product.verified === true ? (
          <span
            className="
              absolute
              right-3
              top-3
              z-20
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-emerald-500
              text-[10px]
              font-black
              text-white
              shadow-sm
            "
          >
            ✓
          </span>
        ) : null}

        {/* Image */}

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title || "Featured deal"}
            className="
              h-full
              w-full
              object-contain
              p-5
              transition-transform
              duration-500
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🏷️
          </div>
        )}
      </div>

      {/* STORE */}

      <div className="mt-3 flex items-center gap-1.5">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={storeName}
            className="h-5 w-5 shrink-0 rounded-md object-contain"
          />
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[8px] font-black text-slate-500">
            {storeName.trim().charAt(0).toUpperCase() || "S"}
          </span>
        )}

        <span className="min-w-0 truncate text-[10px] font-bold text-slate-500">
          {storeName}
        </span>

        <span className="ml-auto text-[9px] font-black text-emerald-600">
          Verified
        </span>
      </div>

      {/* TITLE */}

      <h3 className="mt-2 line-clamp-2 text-[13px] font-black leading-[18px] text-slate-900">
        {product.title || "Featured deal"}
      </h3>

      {/* PRICE */}

      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-black leading-none tracking-tight text-slate-950">
          {salePrice}
        </span>

        {originalPrice ? (
          <span className="pb-0.5 text-[10px] font-medium text-slate-400 line-through">
            {originalPrice}
          </span>
        ) : null}
      </div>

      {/* FOOTER */}

      <div className="mt-3 flex items-center justify-between">
        <Countdown expiresAt={product.expires_at} />

        <span className="text-[10px] font-black text-emerald-600">Shop →</span>
      </div>
    </Link>
  );
}

/* =========================================================
   SMALL SHOWCASE CARD
========================================================= */

function SmallDealCard({
  product,
  placement,
}: {
  product: HeroCoupon;
  placement: "top" | "bottom";
}) {
  const discount = formatDiscount(product.discount_value);

  const salePrice = formatPrice(product.sale_price) || "See deal";

  const storeName = getStoreName(product);

  const storeLogo = getStoreLogo(product);

  const placementClass =
    placement === "top"
      ? "right-[4%] top-[7%] rotate-[3deg]"
      : "right-[5%] bottom-[7%] rotate-[-3deg]";

  return (
    <Link
      href={getCouponHref(product)}
      className={`
        absolute
        z-20
        hidden
        w-[175px]
        overflow-hidden
        rounded-[20px]
        border
        border-white
        bg-white
        p-2.5
        shadow-[0_20px_45px_rgba(15,23,42,0.13)]
        transition-all
        duration-300
        hover:z-40
        hover:rotate-0
        hover:scale-[1.03]
        xl:block
        ${placementClass}
      `}
    >
      <div className="relative flex h-[115px] items-center justify-center overflow-hidden rounded-[15px] bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-1 text-[8px] font-black text-white">
          {discount}
        </span>

        {product.verified === true ? (
          <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
            ✓
          </span>
        ) : null}

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title || "Deal"}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-4xl">🏷️</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={storeName}
            className="h-4 w-4 shrink-0 rounded object-contain"
          />
        ) : (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-100 text-[7px] font-black text-slate-500">
            {storeName.trim().charAt(0).toUpperCase() || "S"}
          </span>
        )}

        <span className="min-w-0 truncate text-[9px] font-bold text-slate-500">
          {storeName}
        </span>
      </div>

      <div className="mt-1.5 line-clamp-2 text-[10px] font-bold leading-3.5 text-slate-700">
        {product.title || "Special deal"}
      </div>

      <div className="mt-2 text-[17px] font-black leading-none tracking-tight text-slate-950">
        {salePrice}
      </div>
    </Link>
  );
}

/* =========================================================
   MOBILE DEAL CARD
========================================================= */

function MobileDealCard({ product }: { product: HeroCoupon }) {
  const discount = formatDiscount(product.discount_value);

  const salePrice = formatPrice(product.sale_price) || "See deal";

  const originalPrice = formatPrice(product.original_price);

  const storeName = getStoreName(product);

  const storeLogo = getStoreLogo(product);

  return (
    <Link
      href={getCouponHref(product)}
      className="
        block
        w-[185px]
        min-w-[185px]
        flex-none
        overflow-hidden
        rounded-[18px]
        border
        border-white/80
        bg-white
        p-2.5
        shadow-[0_16px_35px_rgba(15,23,42,0.16)]
      "
    >
      <div className="relative flex h-[120px] items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-1 text-[8px] font-black text-white">
          {discount}
        </span>

        {product.verified === true ? (
          <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
            ✓
          </span>
        ) : null}

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title || "Deal"}
            className="h-full w-full object-contain p-2.5"
          />
        ) : (
          <span className="text-4xl">🏷️</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={storeName}
            className="h-4 w-4 rounded object-contain"
          />
        ) : (
          <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-100 text-[7px] font-black text-slate-500">
            {storeName.trim().charAt(0).toUpperCase() || "S"}
          </span>
        )}

        <span className="min-w-0 truncate text-[9px] font-bold text-slate-500">
          {storeName}
        </span>
      </div>

      <div className="mt-1.5 line-clamp-2 h-[29px] overflow-hidden text-[10px] font-bold leading-3.5 text-slate-700">
        {product.title || "Special deal"}
      </div>

      <div className="mt-2 flex items-end gap-1.5">
        <span className="text-[17px] font-black leading-none tracking-tight text-slate-950">
          {salePrice}
        </span>

        {originalPrice ? (
          <span className="pb-0.5 text-[9px] font-medium text-slate-400 line-through">
            {originalPrice}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/* =========================================================
   HERO
========================================================= */

export default function Hero({
  coupons = [],
  stats = DEFAULT_STATS,
}: HeroProps) {
  const activeCoupons = useMemo(
    () =>
      coupons.filter((coupon) => {
        if (!coupon.status) {
          return true;
        }

        return coupon.status.toLowerCase() === "active";
      }),
    [coupons],
  );

  const heroCoupons = useMemo(
    () =>
      [...activeCoupons]
        .sort((a, b) => getHeroScore(b) - getHeroScore(a))
        .slice(0, 3),
    [activeCoupons],
  );

  const mainProduct = heroCoupons[0] || null;

  const secondProduct = heroCoupons[1] || heroCoupons[0] || null;

  const thirdProduct = heroCoupons[2] || heroCoupons[0] || null;

  const maxDiscount = heroCoupons.reduce(
    (max, product) => Math.max(max, getDiscountNumber(product.discount_value)),
    0,
  );

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        bg-[#07153f]
        text-white
        shadow-[0_24px_75px_rgba(7,21,63,0.20)]
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND                                       */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute inset-0">
        {/* Left glow */}

        <div className="absolute -left-24 top-1/3 h-[320px] w-[320px] rounded-full bg-emerald-400/8 blur-[100px]" />

        {/* Center glow */}

        <div className="absolute left-[42%] top-[10%] h-[260px] w-[260px] rounded-full bg-cyan-400/8 blur-[90px]" />

        {/* Right glow */}

        <div className="absolute right-[-100px] bottom-[-100px] h-[390px] w-[390px] rounded-full bg-emerald-300/10 blur-[100px]" />

        {/* Small lights */}

        <span className="absolute left-[61%] top-[22%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_5px_rgba(52,211,153,0.30)]" />

        <span className="absolute left-[72%] top-[68%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_14px_5px_rgba(103,232,249,0.25)]" />
      </div>

      {/* ================================================= */}
      {/* CLEAN MINT BACKGROUND                            */}
      {/* ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          hidden
          h-full
          w-[54%]
          bg-emerald-50
          lg:block
        "
        style={{
          clipPath: "polygon(16% 0, 100% 0, 100% 100%, 4% 100%)",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          hidden
          h-full
          w-[49%]
          bg-gradient-to-br
          from-white/80
          via-emerald-50
          to-emerald-100
          lg:block
        "
        style={{
          clipPath: "polygon(24% 0, 100% 0, 100% 100%, 12% 100%)",
        }}
      />

      {/* ================================================= */}
      {/* DESKTOP                                         */}
      {/* ================================================= */}

      <div className="relative z-10 hidden min-h-[500px] grid-cols-[46%_54%] lg:grid">
        {/* ================================================= */}
        {/* LEFT                                           */}
        {/* ================================================= */}

        <div
          className="
            flex
            flex-col
            justify-center
            px-8
            py-12
            lg:px-12
            xl:px-14
          "
        >
          {/* Badge */}

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-white/[0.07] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200 backdrop-blur-md">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-black text-slate-950">
              +
            </span>
            Live deals
          </div>

          {/* Title */}

          <h1
            className="
              mt-6
              max-w-[500px]
              text-[48px]
              font-black
              leading-[0.98]
              tracking-[-0.045em]
              text-white
              xl:text-[56px]
            "
          >
            Find today&apos;s
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              best deals.
            </span>
          </h1>

          {/* Description */}

          <p className="mt-5 max-w-[430px] text-[14px] leading-6 text-white/65 xl:text-[15px]">
            Real-time coupons, limited-time offers and exclusive discounts from
            top brands.
          </p>

          {/* Search */}

          <form
            action="/search"
            method="get"
            className="
              mt-6
              flex
              h-12
              w-full
              max-w-[455px]
              items-center
              rounded-xl
              bg-white
              p-1.5
              shadow-[0_14px_35px_rgba(0,0,0,0.16)]
            "
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 shrink-0 text-slate-400"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M16 16L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                name="q"
                type="search"
                placeholder="Search for a store, product or deal..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-xs
                  font-semibold
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                "
              />
            </div>

            <button
              type="submit"
              className="
                flex
                h-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-emerald-500
                px-4
                text-[10px]
                font-black
                uppercase
                tracking-wide
                text-white
                transition-colors
                hover:bg-emerald-600
              "
            >
              Search
            </button>
          </form>

          {/* Trust */}

          <div className="mt-6 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400/15 text-[10px] text-emerald-300">
                ✓
              </span>

              <span className="text-[9px] font-bold text-white/75">
                Verified deals
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/15 text-[10px] text-cyan-300">
                ⚡
              </span>

              <span className="text-[9px] font-bold text-white/75">
                Updated daily
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400/15 text-[10px] text-emerald-300">
                ◉
              </span>

              <span className="text-[9px] font-bold text-white/75">
                Trusted stores
              </span>
            </div>
          </div>

          {/* Stats */}

          <div className="mt-6 flex items-center gap-5">
            <div>
              <div className="text-lg font-black text-white">
                {stats.dealsTracked.toLocaleString()}
              </div>

              <div className="text-[8px] font-bold uppercase tracking-wide text-white/45">
                Deals tracked
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-lg font-black text-white">
                {stats.newDeals.toLocaleString()}
              </div>

              <div className="text-[8px] font-bold uppercase tracking-wide text-white/45">
                New today
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-lg font-black text-white">
                {stats.verifiedPercentage}%
              </div>

              <div className="text-[8px] font-bold uppercase tracking-wide text-white/45">
                Verified
              </div>
            </div>
          </div>

          {/* CTA */}

          <Link
            href="/coupons"
            className="
              mt-7
              flex
              w-fit
              items-center
              gap-2
              rounded-xl
              bg-emerald-400
              px-5
              py-3.5
              text-xs
              font-black
              text-slate-950
              shadow-[0_12px_30px_rgba(52,211,153,0.22)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-emerald-300
            "
          >
            <span>Explore deals</span>

            <span className="text-base">→</span>
          </Link>
        </div>

        {/* ================================================= */}
        {/* RIGHT SHOWCASE                                  */}
        {/* ================================================= */}

        <div className="relative min-h-[500px] overflow-hidden">
          {/* Stage */}

          <div
            className="
              absolute
              left-[10%]
              top-[13%]
              h-[370px]
              w-[72%]
              rounded-[38px]
              border
              border-white
              bg-white/55
              shadow-[0_25px_70px_rgba(16,185,129,0.10)]
              backdrop-blur-sm
            "
          />

          <div
            className="
              absolute
              left-[15%]
              top-[18%]
              h-[335px]
              w-[62%]
              rounded-[32px]
              bg-white/60
            "
          />

          {/* Decorative rings */}

          <div className="pointer-events-none absolute left-[27%] top-[27%] h-[225px] w-[225px] rounded-full border border-emerald-300/45" />

          <div className="pointer-events-none absolute left-[32%] top-[32%] h-[175px] w-[175px] rounded-full border border-cyan-300/35" />

          {/* Main deal */}

          {mainProduct ? <MainDealCard product={mainProduct} /> : null}

          {/* Top card */}

          {secondProduct ? (
            <SmallDealCard product={secondProduct} placement="top" />
          ) : null}

          {/* Bottom card */}

          {thirdProduct ? (
            <SmallDealCard product={thirdProduct} placement="bottom" />
          ) : null}

          {/* Discount badge */}

          {maxDiscount > 0 ? (
            <div
              className="
                absolute
                bottom-[8%]
                left-[10%]
                z-40
                rounded-[20px]
                bg-emerald-500
                px-5
                py-3.5
                text-white
                shadow-[0_18px_40px_rgba(16,185,129,0.24)]
              "
            >
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/75">
                Save up to
              </div>

              <div className="mt-0.5 text-[30px] font-black leading-none tracking-[-0.04em]">
                {maxDiscount}%
              </div>

              <div className="mt-1 text-[8px] font-bold uppercase tracking-wide text-white/75">
                selected deals
              </div>
            </div>
          ) : null}

          {/* Shop label */}

          <div className="absolute right-[8%] bottom-[9%] z-20 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[9px] font-black text-emerald-700 shadow-sm backdrop-blur-sm">
            Shop smart →
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MOBILE                                           */}
      {/* ================================================= */}

      <div className="relative z-10 block px-4 pb-5 pt-7 lg:hidden">
        {/* Badge */}

        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-white/[0.08] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] text-slate-950">
            +
          </span>
          Live deals
        </div>

        {/* Title */}

        <h1 className="mt-5 text-[37px] font-black leading-[0.98] tracking-[-0.045em] text-white">
          Find today&apos;s
          <span className="block bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            best deals.
          </span>
        </h1>

        {/* Description */}

        <p className="mt-4 max-w-[350px] text-[13px] leading-5 text-white/65">
          Real-time coupons, limited-time offers and exclusive discounts from
          top brands.
        </p>

        {/* Search */}

        <form
          action="/search"
          method="get"
          className="mt-5 flex h-11 items-center rounded-xl bg-white p-1"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 shrink-0 text-slate-400"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M16 16L20 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <input
              name="q"
              type="search"
              placeholder="Search stores, products..."
              className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-white"
            aria-label="Search"
          >
            →
          </button>
        </form>

        {/* Product cards */}

        {heroCoupons.length > 0 ? (
          <div className="mt-5">
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {heroCoupons.map((product) => (
                <MobileDealCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Trust */}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2.5 text-center">
            <div className="text-sm font-black text-white">
              {stats.dealsTracked.toLocaleString()}
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-white/45">
              Tracked
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2.5 text-center">
            <div className="text-sm font-black text-white">
              {stats.newDeals.toLocaleString()}
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-white/45">
              New today
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2.5 text-center">
            <div className="text-sm font-black text-white">
              {stats.verifiedPercentage}%
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-white/45">
              Verified
            </div>
          </div>
        </div>

        {/* CTA */}

        <Link
          href="/coupons"
          className="
            mt-4
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-400
            text-xs
            font-black
            text-slate-950
          "
        >
          Explore deals
          <span className="text-base">→</span>
        </Link>
      </div>
    </section>
  );
}
