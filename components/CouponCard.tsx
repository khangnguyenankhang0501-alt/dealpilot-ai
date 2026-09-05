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

  const storeName = coupon.stores?.name || "Store";

  const storeLogo = coupon.stores?.logo_url || "";

  const storeInitial = storeName.trim().charAt(0).toUpperCase() || "S";

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
        min-h-[430px]
        w-full
        flex-col
        overflow-hidden
        rounded-[20px]
        border
        border-gray-200
        bg-white
        text-slate-900
        shadow-[0_8px_30px_rgba(15,23,42,0.06)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-gray-300
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]
      "
    >
      {/* =========================================================
          IMAGE
      ========================================================= */}

      <div
        className="
          relative
          h-[165px]
          w-full
          shrink-0
          overflow-hidden
          bg-slate-100
          sm:h-[175px]
        "
      >
        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title || "Deal"}
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              320px
            "
            className="
              object-contain
              p-4
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.06]
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
              text-5xl
            "
          >
            🏷️
          </div>
        )}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-cyan-100/0
            via-transparent
            to-emerald-100/20
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {discount && (
          <span
            className="
              absolute
              left-3
              top-3
              z-10
              rounded-lg
              bg-emerald-500
              px-2.5
              py-1.5
              text-[10px]
              font-black
              tracking-wide
              text-white
              shadow-sm
              sm:text-xs
            "
          >
            {discount}
          </span>
        )}

        {coupon.is_exclusive && (
          <span
            className="
              absolute
              bottom-3
              left-3
              z-10
              rounded-lg
              bg-purple-600
              px-2.5
              py-1.5
              text-[10px]
              font-bold
              text-white
              shadow-sm
              sm:text-xs
            "
          >
            Exclusive
          </span>
        )}

        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton
            couponId={String(coupon.id)}
            onChange={onFavoriteChange}
          />
        </div>

        {coupon.verified && (
          <div
            title="Verified deal"
            className="
              absolute
              bottom-3
              right-3
              z-10
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
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

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          p-3.5
          sm:p-4
        "
      >
        <div className="min-w-0">
          {/* BADGES */}

          <div
            className="
              mb-2.5
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
                  rounded-md
                  bg-emerald-50
                  px-2
                  py-1
                  text-[10px]
                  font-extrabold
                  text-emerald-600
                  sm:text-xs
                "
              >
                {discount}
              </span>
            ) : (
              <span
                className="
                  rounded-md
                  bg-slate-100
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-slate-500
                  sm:text-xs
                "
              >
                DEAL
              </span>
            )}

            {coupon.badge && (
              <span
                className="
                  max-w-[55%]
                  truncate
                  rounded-md
                  bg-cyan-50
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  text-cyan-700
                  sm:text-xs
                "
              >
                {coupon.badge}
              </span>
            )}
          </div>

          {/* PRICE */}

          <div
            className="
              mb-1.5
              flex
              min-w-0
              items-baseline
              gap-2
            "
          >
            {salePrice ? (
              <span
                className="
                  truncate
                  text-[20px]
                  font-black
                  leading-none
                  tracking-tight
                  text-slate-900
                  sm:text-[22px]
                "
              >
                {salePrice}
              </span>
            ) : (
              <span
                className="
                  text-[15px]
                  font-extrabold
                  text-slate-700
                "
              >
                See deal
              </span>
            )}

            {originalPrice && (
              <span
                className="
                  shrink-0
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

          {/* TITLE */}

          <h3
            className="
              mb-2
              min-h-[42px]
              line-clamp-2
              text-sm
              font-bold
              leading-[1.45]
              text-slate-900
              sm:min-h-[44px]
              sm:text-[15px]
            "
          >
            {coupon.title || "Special Deal"}
          </h3>

          {/* STORE */}

          <div className="mb-3 min-h-[28px]">
            {hasStore ? (
              <Link
                href={`/stores/${coupon.stores!.slug}`}
                className="
                  group/store
                  flex
                  min-w-0
                  items-center
                  gap-2
                  text-[11px]
                  font-bold
                  text-slate-500
                  transition-colors
                  hover:text-slate-900
                  sm:text-xs
                "
              >
                {/* STORE LOGO */}

                <div
                  className="
    relative
    flex
    h-9
    w-9
    shrink-0
    items-center
    justify-center
    overflow-hidden
    rounded-lg
    border
    border-slate-100
    bg-white
    shadow-sm
  "
                >
                  {storeLogo && !logoFailed ? (
                    <img
                      src={storeLogo}
                      alt={storeName}
                      className="h-full w-full object-contain"
                      onError={() => {
                        setLogoFailed(true);
                      }}
                    />
                  ) : (
                    <span className="text-[11px] font-black text-slate-500">
                      {storeInitial}
                    </span>
                  )}
                </div>

                <span className="min-w-0 truncate">{storeName}</span>

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
              </Link>
            ) : (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  font-bold
                  text-slate-400
                "
              >
                <div
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-md
                    bg-slate-100
                    text-[9px]
                    font-black
                    text-slate-500
                  "
                >
                  {storeInitial}
                </div>

                <span>{storeName}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            BOTTOM
        ========================================================= */}

        <div className="mt-auto">
          {/* CTA */}

          <div
            className="
              flex
              w-full
              items-center
              gap-2
            "
          >
            {hasCode ? (
              <>
                <div
                  className="
                    flex
                    h-10
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-2.5
                    text-[10px]
                    font-black
                    tracking-[0.12em]
                    text-emerald-700
                    sm:text-xs
                  "
                >
                  <span className="truncate">
                    {coupon.coupon_code!.slice(0, 4)}••••
                  </span>
                </div>

                <div className="shrink-0">
                  <CouponLinkButton
                    couponSlug={coupon.slug}
                    couponCode={coupon.coupon_code}
                  />
                </div>
              </>
            ) : (
              <div className="w-full">
                <CouponLinkButton
                  couponSlug={coupon.slug}
                  couponCode={coupon.coupon_code}
                />
              </div>
            )}
          </div>

          {/* TRUST / DETAILS */}

          <div
            className="
              mt-3
              min-h-[58px]
              space-y-1
              border-t
              border-slate-100
              pt-2.5
              text-[10px]
              leading-4
              text-slate-500
              sm:text-[11px]
            "
          >
            {coupon.verified && (
              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
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

                <span>Verified Deal</span>
              </div>
            )}

            {coupon.rating !== null && coupon.rating !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400">★</span>

                <span className="font-semibold text-slate-600">
                  {Number(coupon.rating).toFixed(1)}
                </span>

                {coupon.review_count !== null &&
                  coupon.review_count !== undefined && (
                    <span className="truncate text-slate-400">
                      ({coupon.review_count} reviews)
                    </span>
                  )}
              </div>
            )}

            {coupon.popularity_count !== null &&
              coupon.popularity_count !== undefined &&
              Number(coupon.popularity_count) > 0 && (
                <div className="truncate">
                  🔥 {coupon.popularity_count} clicks
                </div>
              )}

            {coupon.shipping_text && (
              <div className="truncate">🚚 {coupon.shipping_text}</div>
            )}

            {coupon.sold_text && (
              <div className="truncate">{coupon.sold_text}</div>
            )}

            {coupon.expires_at && (
              <div className="truncate text-slate-400">
                Expires: {coupon.expires_at}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
