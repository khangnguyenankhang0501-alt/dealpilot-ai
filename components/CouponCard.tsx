"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import CouponLinkButton from "@/components/CouponLinkButton";
import { Coupon } from "@/types/coupon";

interface CouponCardProps {
  coupon: Coupon;
  onFavoriteChange?: (saved: boolean) => void;
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
   COUPON CARD
========================================================= */

export default function CouponCard({
  coupon,
  onFavoriteChange,
}: CouponCardProps) {
  const hasImage = Boolean(coupon.image_url);

  const discount = formatDiscount(coupon.discount_value);

  const salePrice = formatPrice(coupon.sale_price);

  const originalPrice = formatPrice(coupon.original_price);

  const hasCode = Boolean(coupon.coupon_code);

  const hasStore = Boolean(coupon.stores);

  const storeName = coupon.stores?.name || coupon.store_name || "Store";

  const storeLogo = coupon.stores?.logo_url || "";

  const storeInitial = storeName.trim().charAt(0).toUpperCase() || "S";

  const clicks = formatClicks(coupon.popularity_count);

  const expires = formatExpires(coupon.expires_at);

  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [storeLogo]);

  return (
    <article
      className="
        group
        flex
        h-full
        min-h-[450px]
        w-full
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-slate-200
        bg-white
        text-slate-900
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]
      "
    >
      {/* =======================================================
          IMAGE
      ======================================================= */}

      <div
        className="
          relative
          h-[178px]
          w-full
          shrink-0
          overflow-hidden
          border-b
          border-slate-100
          bg-gradient-to-br
          from-slate-50
          via-white
          to-slate-100
          sm:h-[186px]
        "
      >
        {/* SOFT GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full
            bg-emerald-100/40
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-8
            -left-8
            h-24
            w-24
            rounded-full
            bg-cyan-100/30
            blur-3xl
          "
        />

        {/* PRODUCT IMAGE */}

        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title || "Deal"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="
              relative
              z-[1]
              object-contain
              p-5
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              relative
              z-[1]
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
                h-24
                w-24
                items-center
                justify-center
                rounded-3xl
                border
                border-slate-200
                bg-white
                text-4xl
                shadow-sm
              "
            >
              🏷️
            </div>
          </div>
        )}

        {/* IMAGE OVERLAY */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
            bg-gradient-to-b
            from-white/25
            via-transparent
            to-white/5
          "
        />

        {/* DISCOUNT */}

        {discount && (
          <div
            className="
              absolute
              left-3.5
              top-3.5
              z-10
              rounded-full
              bg-emerald-500
              px-3
              py-1.5
              text-[10px]
              font-black
              tracking-wide
              text-white
              shadow-[0_6px_18px_rgba(16,185,129,0.24)]
              sm:text-xs
            "
          >
            {discount}
          </div>
        )}

        {/* EXCLUSIVE */}

        {coupon.is_exclusive && (
          <div
            className="
              absolute
              bottom-3.5
              left-3.5
              z-10
              rounded-full
              bg-purple-600
              px-3
              py-1.5
              text-[10px]
              font-black
              text-white
              shadow-[0_6px_18px_rgba(147,51,234,0.18)]
              sm:text-xs
            "
          >
            Exclusive
          </div>
        )}

        {/* FAVORITE */}

        <div
          className="
            absolute
            right-3.5
            top-3.5
            z-20
          "
        >
          <FavoriteButton
            couponId={String(coupon.id)}
            onChange={onFavoriteChange}
          />
        </div>

        {/* VERIFIED */}

        {coupon.verified && (
          <div
            title="Verified deal"
            className="
              absolute
              bottom-3.5
              right-3.5
              z-10
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              border-2
              border-white
              bg-emerald-500
              text-xs
              font-black
              text-white
              shadow-md
            "
          >
            ✓
          </div>
        )}
      </div>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-3.5
          sm:p-4
        "
      >
        {/* =====================================================
            DEAL LABELS
        ===================================================== */}

        <div
          className="
            flex
            min-h-[24px]
            flex-wrap
            items-center
            gap-1.5
          "
        >
          {discount ? (
            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-emerald-50
                px-2.5
                py-1
                text-[10px]
                font-black
                text-emerald-700
                ring-1
                ring-inset
                ring-emerald-100
                sm:text-[11px]
              "
            >
              {discount}
            </span>
          ) : (
            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[10px]
                font-black
                text-slate-600
                ring-1
                ring-inset
                ring-slate-200
                sm:text-[11px]
              "
            >
              DEAL
            </span>
          )}

          {coupon.badge && (
            <span
              className="
                max-w-[48%]
                truncate
                rounded-full
                bg-cyan-50
                px-2.5
                py-1
                text-[10px]
                font-bold
                text-cyan-700
                ring-1
                ring-inset
                ring-cyan-100
                sm:text-[11px]
              "
            >
              {coupon.badge}
            </span>
          )}

          {hasCode && (
            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-orange-50
                px-2.5
                py-1
                text-[10px]
                font-black
                text-orange-600
                ring-1
                ring-inset
                ring-orange-100
                sm:text-[11px]
              "
            >
              COUPON
            </span>
          )}
        </div>

        {/* =====================================================
            PRICE
        ===================================================== */}

        <div className="mt-3">
          {salePrice ? (
            <div className="flex min-w-0 items-end gap-2.5">
              <span
                className="
                  truncate
                  text-[25px]
                  font-black
                  leading-none
                  tracking-[-0.03em]
                  text-slate-950
                  sm:text-[27px]
                "
              >
                {salePrice}
              </span>

              {originalPrice && (
                <span
                  className="
                    shrink-0
                    pb-0.5
                    text-[10px]
                    font-medium
                    text-slate-400
                    line-through
                    sm:text-xs
                  "
                >
                  {originalPrice}
                </span>
              )}
            </div>
          ) : (
            <span
              className="
                text-[18px]
                font-black
                leading-none
                tracking-tight
                text-slate-800
                sm:text-xl
              "
            >
              See deal
            </span>
          )}

          {discount && salePrice && originalPrice && (
            <div className="mt-1.5">
              <span
                className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.1em]
                    text-emerald-600
                  "
              >
                Save {discount}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            TITLE
        ===================================================== */}

        <h3
          className="
            mt-2.5
            min-h-[42px]
            line-clamp-2
            text-[14px]
            font-black
            leading-[1.45]
            tracking-[-0.01em]
            text-slate-900
            sm:text-[15px]
          "
        >
          {coupon.title || "Special Deal"}
        </h3>

        {/* =====================================================
            STORE
        ===================================================== */}

        <div className="mt-3 min-h-[45px]">
          {hasStore ? (
            <Link
              href={`/stores/${coupon.stores!.slug}`}
              className="
                group/store
                flex
                min-w-0
                items-center
                gap-2.5
                rounded-xl
                border
                border-transparent
                px-1
                py-1
                transition
                hover:border-slate-100
                hover:bg-slate-50
              "
            >
              {/* STORE LOGO */}

              <div
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
                  shadow-[0_2px_8px_rgba(15,23,42,0.05)]
                "
              >
                {storeLogo && !logoFailed ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="
                      h-full
                      w-full
                      object-contain
                      p-1.5
                    "
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span
                    className="
                      text-xs
                      font-black
                      text-slate-500
                    "
                  >
                    {storeInitial}
                  </span>
                )}
              </div>

              {/* STORE INFO */}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="
                      min-w-0
                      truncate
                      text-[12px]
                      font-black
                      text-slate-700
                      transition-colors
                      group-hover/store:text-slate-900
                      sm:text-[13px]
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
                </div>

                <span
                  className="
                    mt-0.5
                    block
                    text-[10px]
                    font-medium
                    text-slate-400
                    sm:text-[11px]
                  "
                >
                  View store deals →
                </span>
              </div>
            </Link>
          ) : (
            <div
              className="
                flex
                items-center
                gap-2.5
                px-1
                py-1
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
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
                {storeInitial}
              </div>

              <div className="min-w-0">
                <span
                  className="
                    block
                    truncate
                    text-xs
                    font-black
                    text-slate-600
                  "
                >
                  {storeName}
                </span>

                <span
                  className="
                    mt-0.5
                    block
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  Store
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            CTA
        ===================================================== */}

        <div className="mt-4">
          <CouponLinkButton
            couponSlug={coupon.slug}
            couponCode={coupon.coupon_code}
            affiliateUrl={coupon.affiliate_url}
            imageUrl={coupon.image_url}
            discount={discount}
            salePrice={salePrice}
            originalPrice={originalPrice}
            storeName={storeName}
            storeLogo={storeLogo}
            title={coupon.title}
          />
        </div>

        {/* =====================================================
            TRUST / META
        ===================================================== */}

        <div
          className="
            mt-3
            border-t
            border-slate-100
            pt-2.5
          "
        >
          <div
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-x-2
              gap-y-1.5
              text-[10px]
              font-semibold
              text-slate-400
              sm:text-[11px]
            "
          >
            {coupon.verified && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  font-bold
                  text-emerald-600
                "
              >
                <span
                  className="
                    flex
                    h-3.5
                    w-3.5
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-100
                    text-[8px]
                    font-black
                  "
                >
                  ✓
                </span>
                Verified
              </span>
            )}

            {coupon.rating !== null && coupon.rating !== undefined && (
              <>
                {coupon.verified && <span className="text-slate-200">·</span>}

                <span className="inline-flex shrink-0 items-center gap-1">
                  <span className="text-amber-400">★</span>

                  <span className="font-bold text-slate-600">
                    {Number(coupon.rating).toFixed(1)}
                  </span>

                  {coupon.review_count !== null &&
                    coupon.review_count !== undefined && (
                      <span className="text-slate-400">
                        ({coupon.review_count})
                      </span>
                    )}
                </span>
              </>
            )}

            {clicks && (
              <>
                {(coupon.verified ||
                  (coupon.rating !== null && coupon.rating !== undefined)) && (
                  <span className="text-slate-200">·</span>
                )}

                <span className="shrink-0">🔥 {clicks}</span>
              </>
            )}
          </div>

          {(coupon.shipping_text || coupon.sold_text || expires) && (
            <div
              className="
                mt-1.5
                flex
                min-w-0
                items-center
                gap-2
                overflow-hidden
                whitespace-nowrap
                text-[10px]
                font-medium
                text-slate-400
              "
            >
              {coupon.shipping_text && (
                <span className="truncate">🚚 {coupon.shipping_text}</span>
              )}

              {coupon.sold_text && <span className="shrink-0">·</span>}

              {coupon.sold_text && (
                <span className="truncate">{coupon.sold_text}</span>
              )}

              {expires && (
                <>
                  <span className="shrink-0">·</span>

                  <span className="shrink-0">Expires {expires}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
