"use client";

import { useEffect, useState } from "react";

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
  if (value == null || value === "") return null;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return `$${numberValue.toFixed(2)}`;
}

function formatDiscount(value?: number | string | null) {
  if (value == null || value === "") return "DEAL";

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "DEAL";

  return `${numberValue}% OFF`;
}

/* =========================================================
   DESKTOP PRODUCT CARD
========================================================= */

function DesktopProductCard({
  product,
  position,
}: {
  product: HeroCoupon;
  position: "left" | "top" | "bottom";
}) {
  const discount = formatDiscount(product.discount_value);

  const salePrice = formatPrice(product.sale_price) || "See deal";

  const originalPrice = formatPrice(product.original_price);

  const storeName = product.store_name || product.stores?.name || "Store";

  const storeLogo = product.store_logo_url || product.stores?.logo_url || null;

  const href = product.slug ? `/coupons/${product.slug}` : "/deals";

  const positionClass =
    position === "left"
      ? "left-[4%] top-[12%] rotate-[-7deg]"
      : position === "top"
        ? "right-[7%] top-[6%] rotate-[6deg]"
        : "left-[29%] bottom-[5%] rotate-[-3deg]";

  return (
    <a
      href={href}
      className={`
        group
        absolute
        z-20
        block
w-[195px]
max-w-[195px]
        overflow-hidden
        rounded-[20px]
        border
        border-white
        bg-white
        p-3
        text-slate-900
        shadow-[0_25px_60px_rgba(0,0,0,0.35)]
        transition-transform
        duration-300
        ease-out
        hover:z-50
        hover:scale-[1.07]
        ${positionClass}
      `}
    >
      {/* IMAGE */}

      <div className="relative flex h-[142px] w-full items-center justify-center overflow-hidden rounded-[15px] bg-slate-100">
        <span className="absolute left-2 top-2 z-10 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-extrabold text-white shadow-sm">
          {discount}
        </span>

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title || "Deal"}
            className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🏷️
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-100/0 via-transparent to-emerald-100/0 transition-all duration-300 group-hover:from-cyan-100/40 group-hover:to-emerald-100/30" />
      </div>

      {/* PRICE */}

      <div className="mt-3 flex min-w-0 items-baseline gap-2">
        <span className="truncate text-[18px] font-black tracking-tight text-slate-900">
          {salePrice}
        </span>

        {originalPrice && (
          <span className="shrink-0 text-[10px] font-medium text-slate-400 line-through">
            {originalPrice}
          </span>
        )}
      </div>

      {/* TITLE */}

      <p className="mt-1.5 truncate text-[11px] font-semibold text-slate-700">
        {product.title || "Special Deal"}
      </p>

      {/* STORE */}

      <div className="mt-2 flex min-w-0 items-center gap-1.5">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={storeName}
            className="h-4 w-4 shrink-0 rounded object-contain"
          />
        ) : (
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-100 text-[8px] font-bold text-slate-500">
            S
          </div>
        )}

        <span className="min-w-0 truncate text-[10px] font-bold text-slate-500">
          {storeName}
        </span>

        {product.verified === true && (
          <span
            title="Verified deal"
            className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-black text-emerald-600"
          >
            ✓
          </span>
        )}
      </div>
    </a>
  );
}

/* =========================================================
   COUNTDOWN
========================================================= */

function Countdown({
  expiresAt,
  discount,
}: {
  expiresAt?: string | null;
  discount?: number | string | null;
}) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const calculateSeconds = () => {
      if (!expiresAt) return 0;

      const expiresTime = new Date(expiresAt).getTime();

      if (!Number.isFinite(expiresTime)) return 0;

      return Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
    };

    setSecondsLeft(calculateSeconds());

    const timer = window.setInterval(() => {
      setSecondsLeft(calculateSeconds());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const hours = Math.floor(secondsLeft / 3600);

  const minutes = Math.floor((secondsLeft % 3600) / 60);

  const seconds = secondsLeft % 60;

  const discountNumber = discount != null ? Number(discount) : NaN;

  const discountText = Number.isFinite(discountNumber)
    ? `${discountNumber}%`
    : "DEAL";

  const hasCountdown = Boolean(expiresAt) && secondsLeft > 0;

  return (
    <div
      className="
        absolute
        bottom-5
        right-5
        z-40
        w-[215px]
        max-w-[calc(100%-20px)]
        overflow-hidden
        rounded-[22px]
        border
        border-white/15
        bg-slate-950/90
        p-4
        shadow-[0_25px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
    >
      {/* GLOW */}

      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-3xl" />

      {/* HEADER */}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-white">
          <span>🔥</span>
          ENDING SOON
        </div>

        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
        </span>
      </div>

      {/* TIMER */}

      {hasCountdown ? (
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-2 text-center">
            <div className="text-2xl font-black tabular-nums text-white">
              {String(hours).padStart(2, "0")}
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/45">
              Hours
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-2 text-center">
            <div className="text-2xl font-black tabular-nums text-white">
              {String(minutes).padStart(2, "0")}
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/45">
              Mins
            </div>
          </div>

          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-2 py-2 text-center">
            <div className="text-2xl font-black tabular-nums text-rose-300">
              {String(seconds).padStart(2, "0")}
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-rose-300/60">
              Secs
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-5 rounded-xl bg-white/5 py-4 text-center text-sm font-bold text-white/60">
          Deal ending soon
        </div>
      )}

      {/* DISCOUNT */}

      <div className="relative mt-4 overflow-hidden rounded-[16px] bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 px-4 py-3 text-center text-white shadow-[0_10px_30px_rgba(236,72,153,0.25)]">
        <div className="relative text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">
          Save up to
        </div>

        <div className="relative mt-0.5 text-3xl font-black leading-none">
          {discountText}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO SCORE
========================================================= */

function getHeroScore(coupon: HeroCoupon) {
  const discount = Number(coupon.discount_value) || 0;

  const rating = Number(coupon.rating) || 0;

  const reviews = Number(coupon.review_count) || 0;

  const popularity = Number(coupon.popularity_count) || 0;

  const clicks = Number(coupon.click_count) || 0;

  const hasImage = coupon.image_url ? 1 : 0;

  const hasPrice = coupon.sale_price != null ? 1 : 0;

  const isVerified = coupon.verified === true ? 1 : 0;

  const isFeatured =
    coupon.featured === true || coupon.is_featured === true ? 1 : 0;

  let expirationScore = 0;

  if (coupon.expires_at) {
    const expires = new Date(coupon.expires_at).getTime();

    if (Number.isFinite(expires)) {
      const now = Date.now();

      const hoursLeft = (expires - now) / (1000 * 60 * 60);

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
    isVerified * 20 +
    isFeatured * 15 +
    hasImage * 10 +
    hasPrice * 5 +
    expirationScore
  );
}

/* =========================================================
   MOBILE PRODUCT CARD
========================================================= */

function MobileProductCard({ product }: { product: HeroCoupon }) {
  const discount = formatDiscount(product.discount_value);

  const salePrice = formatPrice(product.sale_price) || "See deal";

  const originalPrice = formatPrice(product.original_price);

  const storeName = product.store_name || product.stores?.name || "Store";

  const storeLogo = product.store_logo_url || product.stores?.logo_url || null;

  const href = product.slug ? `/coupons/${product.slug}` : "/deals";

  return (
    <a
      href={href}
      className="
        group
        block
        w-[158px]
        min-w-[158px]
        max-w-[158px]
        flex-none
        overflow-hidden
        rounded-[18px]
        border
        border-white/80
        bg-white
        p-2.5
        text-slate-900
        shadow-[0_15px_35px_rgba(0,0,0,0.25)]
        transition-transform
        duration-300
        ease-out
        hover:scale-[1.03]
        active:scale-[0.98]
      "
    >
      {/* IMAGE */}

      <div className="relative h-[112px] w-full overflow-hidden rounded-[13px] bg-slate-100">
        {/* DISCOUNT */}

        <span className="absolute left-2 top-2 z-10 rounded-md bg-emerald-500 px-1.5 py-1 text-[9px] font-black text-white shadow-sm">
          {discount}
        </span>

        {/* PRODUCT IMAGE */}

        <div className="flex h-full w-full items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title || "Deal"}
              className="
                h-full
                w-full
                object-contain
                p-2
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <span className="text-4xl">🏷️</span>
          )}
        </div>

        {/* VERIFIED */}

        {product.verified === true && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow">
            ✓
          </span>
        )}
      </div>

      {/* PRICE */}

      <div className="mt-2.5 flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-sm font-black tracking-tight text-slate-900">
          {salePrice}
        </span>

        {originalPrice && (
          <span className="shrink-0 text-[9px] font-medium text-slate-400 line-through">
            {originalPrice}
          </span>
        )}
      </div>

      {/* TITLE */}

      <div className="mt-1 h-[28px] overflow-hidden text-[10px] font-bold leading-3.5 text-slate-700">
        {product.title || "Special Deal"}
      </div>

      {/* STORE */}

      <div className="mt-1.5 flex min-w-0 items-center gap-1">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={storeName}
            className="h-3.5 w-3.5 shrink-0 rounded object-contain"
          />
        ) : (
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-slate-100 text-[7px] font-bold text-slate-500">
            S
          </span>
        )}

        <span className="min-w-0 truncate text-[9px] font-bold text-slate-500">
          {storeName}
        </span>
      </div>
    </a>
  );
}

/* =========================================================
   HERO
========================================================= */

export default function Hero({
  coupons = [],
  stats = DEFAULT_STATS,
}: HeroProps) {
  /* ACTIVE */

  const activeCoupons = coupons.filter((coupon) => {
    if (!coupon.status) return true;

    return coupon.status.toLowerCase() === "active";
  });

  /* TOP 3 */

  const heroCoupons = [...activeCoupons]
    .sort((a, b) => getHeroScore(b) - getHeroScore(a))
    .slice(0, 3);

  const positions: Array<"left" | "top" | "bottom"> = ["left", "top", "bottom"];

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[24px]
        bg-[#07133f]
        text-white
        shadow-xl
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0">
        {/* PURPLE */}

        <div className="absolute -right-20 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/30 blur-[100px]" />

        {/* CYAN */}

        <div className="absolute left-[45%] top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[80px]" />

        {/* PINK */}

        <div className="absolute right-[10%] top-[10%] h-32 w-32 rounded-full bg-fuchsia-500/10 blur-[50px]" />

        {/* PARTICLES */}

        <div className="absolute left-[50%] top-[45%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_8px_rgba(34,211,238,0.35)]" />

        <div className="absolute left-[68%] top-[25%] h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_16px_6px_rgba(217,70,239,0.35)]" />

        <div className="absolute left-[82%] top-[62%] h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_14px_5px_rgba(52,211,153,0.35)]" />
      </div>

      {/* DOTS */}

      <div className="pointer-events-none absolute right-8 top-8 opacity-30">
        <div className="grid grid-cols-6 gap-3">
          {Array.from({
            length: 36,
          }).map((_, index) => (
            <span key={index} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="relative z-10 grid min-h-[480px] grid-cols-1 lg:grid-cols-[44%_56%]">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
          {/* BADGE */}

          <div className="mb-5 flex w-fit items-center rounded-full border border-cyan-300/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-cyan-100 shadow-lg backdrop-blur-md">
            ⚡ LIVE DEAL RADAR
          </div>

          {/* TITLE */}

          <h1 className="max-w-[520px] text-[38px] font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[54px]">
            Smart deals.
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Bigger savings.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-5 max-w-[440px] text-sm leading-6 text-white/75 sm:text-base">
            We track thousands of coupons and price drops so you don&apos;t have
            to.
          </p>

          {/* STATS */}

          <div className="mt-7 grid max-w-[500px] grid-cols-3 gap-4">
            <div>
              <div className="text-xl font-extrabold sm:text-2xl">
                {stats.dealsTracked.toLocaleString()}
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/60 sm:text-xs">
                Deals tracked
                <br />
                today
              </div>
            </div>

            <div>
              <div className="text-xl font-extrabold sm:text-2xl">
                {stats.newDeals.toLocaleString()}
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/60 sm:text-xs">
                New deals
                <br />
                today
              </div>
            </div>

            <div>
              <div className="text-xl font-extrabold sm:text-2xl">
                {stats.verifiedPercentage}%
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/60 sm:text-xs">
                Verified &
                <br />
                working
              </div>
            </div>
          </div>

          {/* CTA */}

          <a
            href="/deals"
            className="
              mt-8
              flex
              w-fit
              items-center
              gap-3
              rounded-xl
              bg-emerald-400
              px-6
              py-3.5
              text-sm
              font-extrabold
              text-slate-950
              shadow-[0_10px_30px_rgba(52,211,153,0.25)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-emerald-300
              hover:shadow-[0_15px_35px_rgba(52,211,153,0.35)]
            "
          >
            Explore Deals
            <span className="text-lg">→</span>
          </a>
        </div>

        {/* =================================================
            DESKTOP
        ================================================= */}

        <div className="relative hidden min-h-[480px] lg:block">
          {/* RINGS */}

          <div className="absolute left-[12%] top-[17%] h-[330px] w-[330px] rounded-full border border-cyan-300/20" />

          <div className="absolute left-[17%] top-[22%] h-[250px] w-[250px] rounded-full border border-fuchsia-400/20" />

          {/* GLOW */}

          <div className="pointer-events-none absolute left-[24%] top-[29%] h-[170px] w-[170px] rounded-full bg-cyan-400/10 blur-[60px]" />

          {/* CARDS */}

          {heroCoupons.map((product, index) => (
            <DesktopProductCard
              key={product.id}
              product={product}
              position={positions[index]}
            />
          ))}

          {/* COUNTDOWN */}

          {heroCoupons.length > 0 && (
            <Countdown
              expiresAt={heroCoupons[0]?.expires_at}
              discount={heroCoupons[0]?.discount_value}
            />
          )}
        </div>

        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="block min-w-0 px-4 pb-6 lg:hidden">
          {/* PRODUCT SCROLLER */}

          <div
            className="
              -mx-1
              flex
              w-full
              min-w-0
              gap-3
              overflow-x-auto
              px-1
              pb-2
              pt-2
              overscroll-x-contain
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {heroCoupons.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* SWIPE */}

          {heroCoupons.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-white/45">
              <span>Swipe to explore deals</span>

              <span className="text-white/70">→</span>
            </div>
          )}

          {/* MOBILE COUNTDOWN */}

          {heroCoupons.length > 0 && (
            <div className="relative mt-4 h-[185px] w-full">
              <Countdown
                expiresAt={heroCoupons[0]?.expires_at}
                discount={heroCoupons[0]?.discount_value}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
