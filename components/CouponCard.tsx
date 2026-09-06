"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import FavoriteButton from "@/components/FavoriteButton";
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
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CouponCard({
  coupon,
  onFavoriteChange,
}: CouponCardProps) {
  const router = useRouter();

  const hasImage = Boolean(coupon.image_url);

  const discount = formatDiscount(coupon.discount_value);

  const salePrice = formatPrice(coupon.sale_price);

  const originalPrice = formatPrice(coupon.original_price);

  const hasCode = Boolean(coupon.coupon_code);

  const hasStore = Boolean(coupon.stores);

  const storeName = coupon.stores?.name || coupon.store_name || "Store";

  const storeLogo = coupon.stores?.logo_url || "";

  const storeSlug = coupon.stores?.slug || "";

  const storeInitial = storeName.trim().charAt(0).toUpperCase() || "S";

  const clicks = formatClicks(coupon.popularity_count);

  const expires = formatExpires(coupon.expires_at);

  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [storeLogo]);

  /* =======================================================
     OPEN DETAIL PAGE
  ======================================================= */

  const openDetailPage = () => {
    router.push(`/coupons/${coupon.slug}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetailPage();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={coupon.title ? `View deal: ${coupon.title}` : "View deal"}
      onClick={openDetailPage}
      onKeyDown={handleKeyDown}
      className="
        group
        flex
        h-full
        min-h-[345px]
        w-full
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-[20px]
        border
        border-slate-200
        bg-white
        text-slate-900
        shadow-[0_6px_24px_rgba(15,23,42,0.055)]
        outline-none
        transition-all
        duration-200
        ease-out
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_16px_34px_rgba(15,23,42,0.11)]
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        focus-visible:ring-offset-2
      "
    >
      {/* ===================================================
          PRODUCT IMAGE
      =================================================== */}

      <div
        className="
          relative
          mx-3
          mt-3
          h-[172px]
          shrink-0
          overflow-hidden
          rounded-[16px]
          bg-slate-50
          sm:h-[178px]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-slate-50
            via-white
            to-slate-100
          "
        />

        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title || "Deal"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
            className="
              relative
              z-[1]
              object-contain
              p-3
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
                rounded-2xl
                border
                border-slate-200
                bg-white
                text-3xl
                shadow-sm
              "
            >
              🏷️
            </div>
          </div>
        )}

        {/* DISCOUNT */}

        {discount && (
          <div
            className="
              absolute
              left-2.5
              top-2.5
              z-20
              rounded-full
              bg-emerald-500
              px-3
              py-1.5
              text-[11px]
              font-black
              tracking-tight
              text-white
              shadow-[0_7px_18px_rgba(16,185,129,0.24)]
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
              bottom-2.5
              left-2.5
              z-20
              rounded-full
              bg-purple-600
              px-2.5
              py-1
              text-[9px]
              font-black
              text-white
              shadow-md
            "
          >
            Exclusive
          </div>
        )}

        {/* FAVORITE */}

        <div
          className="
            absolute
            right-2.5
            top-2.5
            z-30
          "
          onClick={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
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
              bottom-2.5
              right-2.5
              z-20
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

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          px-3.5
          pb-3.5
          pt-3
          sm:px-4
        "
      >
        {/* STORE */}

        {hasStore ? (
          <Link
            href={storeSlug ? `/stores/${storeSlug}` : "#"}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-lg
              transition
              hover:opacity-80
            "
          >
            <div
              className="
                relative
                flex
                h-8
                w-8
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
              {storeLogo && !logoFailed ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="
                    h-full
                    w-full
                    object-contain
                    p-1
                  "
                  onError={() => {
                    setLogoFailed(true);
                  }}
                />
              ) : (
                <span
                  className="
                    text-[10px]
                    font-black
                    text-slate-500
                  "
                >
                  {storeInitial}
                </span>
              )}
            </div>

            <span
              className="
                min-w-0
                truncate
                text-[11px]
                font-bold
                text-slate-500
                sm:text-xs
              "
            >
              {storeName}
            </span>

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
                  text-[8px]
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
              min-w-0
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-slate-100
                text-[10px]
                font-black
                text-slate-500
              "
            >
              {storeInitial}
            </div>

            <span
              className="
                truncate
                text-[11px]
                font-bold
                text-slate-500
                sm:text-xs
              "
            >
              {storeName}
            </span>
          </div>
        )}

        {/* TITLE */}

        <h3
          className="
            mt-2.5
            line-clamp-2
            min-h-[40px]
            text-[14px]
            font-black
            leading-[1.4]
            tracking-[-0.012em]
            text-slate-900
            sm:text-[15px]
          "
        >
          {coupon.title || "Special Deal"}
        </h3>

        {/* PRICE */}

        <div
          className="
            mt-2.5
            flex
            min-w-0
            items-end
            gap-2.5
          "
        >
          {salePrice ? (
            <span
              className="
                truncate
                text-[24px]
                font-black
                leading-none
                tracking-[-0.04em]
                text-slate-950
                sm:text-[26px]
              "
            >
              {salePrice}
            </span>
          ) : (
            <span
              className="
                text-[17px]
                font-black
                leading-none
                text-slate-800
              "
            >
              See deal
            </span>
          )}

          {originalPrice && (
            <span
              className="
                shrink-0
                pb-0.5
                text-[10px]
                font-semibold
                text-slate-400
                line-through
                sm:text-xs
              "
            >
              {originalPrice}
            </span>
          )}
        </div>

        {/* TAGS */}

        <div
          className="
            mt-2.5
            flex
            min-h-[26px]
            flex-wrap
            items-center
            gap-1.5
          "
        >
          {hasCode && (
            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-orange-50
                px-2.5
                py-1
                text-[9px]
                font-black
                tracking-wide
                text-orange-600
                ring-1
                ring-inset
                ring-orange-100
                sm:text-[10px]
              "
            >
              COUPON
            </span>
          )}

          {coupon.badge && (
            <span
              className="
                max-w-[55%]
                truncate
                rounded-full
                bg-cyan-50
                px-2.5
                py-1
                text-[9px]
                font-bold
                text-cyan-700
                ring-1
                ring-inset
                ring-cyan-100
                sm:text-[10px]
              "
            >
              {coupon.badge}
            </span>
          )}

          {!hasCode && !coupon.badge && (
            <span
              className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-emerald-50
                  px-2.5
                  py-1
                  text-[9px]
                  font-black
                  text-emerald-700
                  ring-1
                  ring-inset
                  ring-emerald-100
                  sm:text-[10px]
                "
            >
              DEAL
            </span>
          )}
        </div>

        {/* META */}

        <div className="mt-auto pt-3">
          <div
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-x-1.5
              gap-y-1
              border-t
              border-slate-100
              pt-2.5
              text-[9px]
              font-semibold
              text-slate-400
              sm:text-[10px]
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
                {coupon.verified && <span className="text-slate-200">|</span>}

                <span
                  className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1
                    "
                >
                  <span className="text-amber-400">★</span>

                  <span className="text-slate-600">
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
                  <span className="text-slate-200">|</span>
                )}

                <span className="shrink-0">🔥 {clicks}</span>
              </>
            )}
          </div>

          {(coupon.sold_text || coupon.shipping_text || expires) && (
            <div
              className="
                mt-1.5
                flex
                min-w-0
                items-center
                gap-1.5
                overflow-hidden
                whitespace-nowrap
                text-[9px]
                font-medium
                text-slate-400
                sm:text-[10px]
              "
            >
              {coupon.sold_text && (
                <span className="truncate">{coupon.sold_text}</span>
              )}

              {coupon.shipping_text && coupon.sold_text && (
                <span className="shrink-0 text-slate-200">|</span>
              )}

              {coupon.shipping_text && (
                <span className="truncate">{coupon.shipping_text}</span>
              )}

              {expires && (
                <>
                  <span className="shrink-0 text-slate-200">|</span>

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
