"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import CouponLinkButton from "@/components/CouponLinkButton";
import type { Coupon } from "@/types/coupon";

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
  const hasCode = Boolean(coupon.coupon_code);

  const discount = formatDiscount(coupon.discount_value);
  const salePrice = formatPrice(coupon.sale_price);
  const originalPrice = formatPrice(coupon.original_price);

  const hasStore = Boolean(coupon.stores);
  const storeName = coupon.stores?.name || coupon.store_name || "Store";
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
        min-h-[380px]
        w-full
        flex-col
        overflow-hidden
        rounded-[16px]
        border
        border-slate-200
        bg-white
        text-slate-900
        shadow-[0_6px_20px_rgba(15,23,42,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]
      "
    >
      {/* =========================================================
          IMAGE
      ========================================================= */}

      <div
        className="
          relative
          h-[128px]
          w-full
          shrink-0
          overflow-hidden
          border-b
          border-slate-100
          bg-white
          sm:h-[136px]
        "
      >
        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title || "Deal"}
            fill
            sizes="
              (max-width: 640px) 210px,
              (max-width: 1024px) 190px,
              220px
            "
            className="
              object-contain
              p-3
              transition-transform
              duration-300
              ease-out
              group-hover:scale-[1.03]
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
              bg-slate-50
              text-4xl
            "
          >
            🏷️
          </div>
        )}

        {/* DISCOUNT */}

        <div className="absolute left-2.5 top-2.5 z-10">
          {discount ? (
            <span
              className="
                inline-flex
                rounded-full
                bg-emerald-500
                px-2
                py-1
                text-[9px]
                font-black
                leading-none
                text-white
                shadow-sm
                sm:text-[10px]
              "
            >
              {discount}
            </span>
          ) : (
            <span
              className="
                inline-flex
                rounded-full
                bg-slate-100
                px-2
                py-1
                text-[9px]
                font-black
                leading-none
                text-slate-600
              "
            >
              DEAL
            </span>
          )}
        </div>

        {/* EXCLUSIVE */}

        {coupon.is_exclusive && (
          <span
            className="
              absolute
              bottom-2.5
              left-2.5
              z-10
              rounded-full
              bg-purple-600
              px-2
              py-1
              text-[9px]
              font-black
              leading-none
              text-white
              shadow-sm
            "
          >
            Exclusive
          </span>
        )}

        {/* FAVORITE */}

        <div className="absolute right-2.5 top-2.5 z-20">
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
              bottom-2.5
              right-2.5
              z-10
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-emerald-500
              text-[9px]
              font-black
              text-white
              shadow-sm
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
          p-3
        "
      >
        {/* STORE */}

        <div className="mb-2 min-w-0">
          {hasStore ? (
            <Link
              href={`/stores/${coupon.stores!.slug}`}
              className="
                flex
                min-w-0
                items-center
                gap-1.5
                text-[10px]
                font-bold
                text-slate-500
                transition-colors
                hover:text-emerald-600
              "
            >
              <div
                className="
                  relative
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-md
                  border
                  border-slate-100
                  bg-white
                "
              >
                {storeLogo && !logoFailed ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="h-full w-full object-contain p-0.5"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="text-[7px] font-black text-slate-500">
                    {storeInitial}
                  </span>
                )}
              </div>

              <span className="min-w-0 truncate">{storeName}</span>

              {coupon.verified && (
                <span
                  className="
                    flex
                    h-3.5
                    w-3.5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-100
                    text-[7px]
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
                gap-1.5
                text-[10px]
                font-bold
                text-slate-400
              "
            >
              <div
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-md
                  bg-slate-100
                  text-[7px]
                  font-black
                  text-slate-500
                "
              >
                {storeInitial}
              </div>

              <span className="truncate">{storeName}</span>
            </div>
          )}
        </div>

        {/* TITLE */}

        <h3
          className="
            min-h-[36px]
            line-clamp-2
            text-[12px]
            font-black
            leading-[1.45]
            text-slate-900
            sm:text-[13px]
          "
        >
          {coupon.title || "Special Deal"}
        </h3>

        {/* PRICE */}

        <div className="mt-2 flex min-w-0 items-baseline gap-1.5">
          {salePrice ? (
            <span
              className="
                truncate
                text-[17px]
                font-black
                leading-none
                tracking-tight
                text-slate-900
              "
            >
              {salePrice}
            </span>
          ) : (
            <span
              className="
                text-[12px]
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
                text-[9px]
                font-medium
                text-slate-400
                line-through
              "
            >
              {originalPrice}
            </span>
          )}
        </div>

        {/* MINI INFO */}

        <div className="mt-2 min-h-[16px]">
          {coupon.badge ? (
            <span
              className="
                inline-block
                max-w-full
                truncate
                rounded-md
                bg-cyan-50
                px-1.5
                py-0.5
                text-[8px]
                font-bold
                text-cyan-700
              "
            >
              {coupon.badge}
            </span>
          ) : coupon.rating !== null && coupon.rating !== undefined ? (
            <span className="text-[9px] font-semibold text-slate-400">
              <span className="text-amber-400">★</span>{" "}
              {Number(coupon.rating).toFixed(1)}
              {coupon.review_count !== null && coupon.review_count !== undefined
                ? ` (${coupon.review_count})`
                : ""}
            </span>
          ) : coupon.popularity_count !== null &&
            coupon.popularity_count !== undefined &&
            Number(coupon.popularity_count) > 0 ? (
            <span className="text-[9px] font-semibold text-slate-400">
              🔥 {coupon.popularity_count} clicks
            </span>
          ) : (
            <span className="text-[9px] text-slate-300">Verified savings</span>
          )}
        </div>

        {/* =========================================================
            BOTTOM
        ========================================================= */}

        <div className="mt-auto pt-3">
          {/* CTA */}

          <CouponLinkButton
            couponSlug={coupon.slug}
            couponCode={coupon.coupon_code}
            affiliateUrl={coupon.affiliate_url}
            title={coupon.title || "Special Deal"}
            imageUrl={coupon.image_url}
            discount={discount}
            salePrice={salePrice}
            originalPrice={originalPrice}
            storeName={storeName}
          />

          {/* TRUST LINE */}

          <div
            className="
              mt-2
              flex
              min-h-[15px]
              items-center
              justify-between
              gap-2
              border-t
              border-slate-100
              pt-2
            "
          >
            {coupon.verified ? (
              <span
                className="
                  flex
                  items-center
                  gap-1
                  truncate
                  text-[8px]
                  font-bold
                  text-emerald-600
                  sm:text-[9px]
                "
              >
                <span>✓</span>
                Verified deal
              </span>
            ) : (
              <span
                className="
                  truncate
                  text-[8px]
                  font-medium
                  text-slate-400
                  sm:text-[9px]
                "
              >
                DealPilot offer
              </span>
            )}

            {hasCode ? (
              <span
                className="
                  shrink-0
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-300
                "
              >
                CODE
              </span>
            ) : (
              <span
                className="
                  shrink-0
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-300
                "
              >
                DEAL
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
