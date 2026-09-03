import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import CouponLinkButton from "@/components/CouponLinkButton";
import { Coupon } from "@/types/coupon";

interface CouponCardProps {
  coupon: Coupon;
  onFavoriteChange?: (saved: boolean) => void;
}

export default function CouponCard({
  coupon,
  onFavoriteChange,
}: CouponCardProps) {
  const hasImage = Boolean(coupon.image_url);

  const hasDiscount =
    coupon.discount_value !== null && coupon.discount_value !== undefined;

  const hasPrice =
    coupon.sale_price !== null && coupon.sale_price !== undefined;

  const hasOriginalPrice =
    coupon.original_price !== null && coupon.original_price !== undefined;

  const hasCode = Boolean(coupon.coupon_code);

  return (
    <article
      className="
        group
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-[transform,box-shadow,border-color]
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-gray-300
        hover:shadow-lg
      "
    >
      {/* =========================================================
          IMAGE
      ========================================================= */}

      <div
        className="
          relative
          h-[150px]
          w-full
          shrink-0
          overflow-hidden
          bg-gray-50
          p-3
          sm:h-[160px]
          sm:p-3.5
        "
      >
        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title}
            fill
            sizes="
              (max-width: 640px) 280px,
              (max-width: 1024px) 320px,
              320px
            "
            className="
              object-contain
              object-center
              p-2
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}

        {/* VERIFIED */}

        {coupon.verified && (
          <span
            className="
              absolute
              left-3
              top-3
              z-10
              rounded-full
              border
              border-gray-100
              bg-white
              px-2
              py-1
              text-[10px]
              font-bold
              text-gray-800
              shadow-sm
              sm:text-xs
            "
          >
            Verified
          </span>
        )}

        {/* EXCLUSIVE */}

        {coupon.is_exclusive && (
          <span
            className="
              absolute
              bottom-3
              left-3
              z-10
              rounded-md
              bg-purple-600
              px-2
              py-1
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

        {/* FAVORITE */}

        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton
            couponId={String(coupon.id)}
            onChange={onFavoriteChange}
          />
        </div>
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
          justify-between
          p-3
          sm:p-3.5
        "
      >
        {/* TOP CONTENT */}

        <div className="min-w-0">
          {/* DISCOUNT / BADGE */}

          <div
            className="
              mb-2.5
              flex
              min-h-[22px]
              flex-wrap
              items-center
              gap-1.5
            "
          >
            {hasDiscount && (
              <span
                className="
                  rounded-md
                  bg-red-50
                  px-2
                  py-1
                  text-xs
                  font-bold
                  text-red-600
                  sm:text-sm
                "
              >
                {coupon.discount_value}% OFF
              </span>
            )}

            {coupon.badge && (
              <span
                className="
                  max-w-full
                  truncate
                  rounded-md
                  bg-green-50
                  px-2
                  py-1
                  text-xs
                  font-medium
                  text-green-700
                  sm:text-sm
                "
              >
                {coupon.badge}
              </span>
            )}
          </div>

          {/* PRICE */}

          {hasPrice && (
            <div className="mb-1 flex min-w-0 items-baseline gap-1.5">
              <span
                className="
                  truncate
                  text-lg
                  font-extrabold
                  tracking-tight
                  text-gray-900
                  sm:text-xl
                "
              >
                ${Number(coupon.sale_price).toFixed(2)}
              </span>

              {hasOriginalPrice && (
                <span
                  className="
                    shrink-0
                    text-xs
                    font-medium
                    text-gray-400
                    line-through
                    sm:text-sm
                  "
                >
                  ${Number(coupon.original_price).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* TITLE */}

          <h3
            className="
              mb-2
              min-h-[40px]
              line-clamp-2
              text-sm
              font-bold
              leading-5
              text-gray-900
              sm:min-h-[44px]
              sm:text-base
              sm:leading-6
            "
          >
            {coupon.title}
          </h3>

          {/* STORE */}

          {coupon.stores && (
            <div className="mb-3">
              <Link
                href={`/stores/${coupon.stores.slug}`}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-gray-500
                  transition-colors
                  hover:text-gray-900
                  sm:text-sm
                "
              >
                {coupon.stores.logo_url ? (
                  <div
                    className="
                      relative
                      h-5
                      w-5
                      shrink-0
                      overflow-hidden
                      rounded-md
                      border
                      border-gray-100
                      bg-white
                      sm:h-6
                      sm:w-6
                    "
                  >
                    <Image
                      src={coupon.stores.logo_url}
                      alt={coupon.stores.name}
                      fill
                      sizes="24px"
                      className="object-contain p-1"
                    />
                  </div>
                ) : null}

                <span className="min-w-0 truncate">{coupon.stores.name}</span>
              </Link>
            </div>
          )}
        </div>

        {/* =========================================================
            BOTTOM CONTENT
        ========================================================= */}

        <div className="mt-auto">
          {/* CTA */}

          <div className="mt-3 flex w-full items-center gap-2">
            {hasCode ? (
              <>
                {/* CODE */}

                <div
                  className="
                    flex
                    h-10
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-lg
                    border
                    border-green-300
                    bg-green-50
                    px-2
                    text-[10px]
                    font-bold
                    tracking-wider
                    text-green-700
                    sm:text-xs
                  "
                >
                  <span className="truncate">
                    {coupon.coupon_code!.slice(0, 4)}••••
                  </span>
                </div>

                {/* BUTTON */}

                <div className="w-auto shrink-0">
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

          {/* =====================================================
              TRUST / DETAILS
          ===================================================== */}

          <div className="mt-3 space-y-1 text-[10px] leading-4 text-gray-500 sm:text-xs">
            {/* VERIFIED */}

            {coupon.verified && (
              <div className="font-semibold text-green-600">Verified Deal</div>
            )}

            {/* RATING */}

            {coupon.rating !== null && coupon.rating !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>

                <span>{Number(coupon.rating).toFixed(1)}</span>

                {coupon.review_count !== null &&
                  coupon.review_count !== undefined && (
                    <span className="truncate">
                      ({coupon.review_count} reviews)
                    </span>
                  )}
              </div>
            )}

            {/* POPULARITY */}

            {coupon.popularity_count !== null &&
              coupon.popularity_count !== undefined &&
              coupon.popularity_count > 0 && (
                <div className="truncate">
                  🔥 {coupon.popularity_count} clicks
                </div>
              )}

            {/* SHIPPING */}

            {coupon.shipping_text && (
              <div className="truncate">{coupon.shipping_text}</div>
            )}

            {/* SOLD */}

            {coupon.sold_text && (
              <div className="truncate">{coupon.sold_text}</div>
            )}

            {/* EXPIRATION */}

            {coupon.expires_at && (
              <div className="truncate">Expires: {coupon.expires_at}</div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
