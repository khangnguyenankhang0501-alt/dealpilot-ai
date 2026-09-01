import Image from "next/image";
import Link from "next/link";

type Coupon = {
  id: string;
  title: string;
  slug: string | null;
  store_name: string | null;

  coupon_code: string | null;
  affiliate_url: string | null;

  image_url: string | null;

  discount_type: string | null;
  discount_value: number | null;

  original_price: number | null;
  sale_price: number | null;

  verified: boolean | null;
  is_exclusive: boolean | null;

  badge: string | null;

  rating: number | null;
  review_count: number | null;

  popularity_count: number | null;

  shipping_text: string | null;
  sold_text: string | null;

  expires_at: string | null;
};

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const hasImage = Boolean(coupon.image_url);

  const hasCode = Boolean(coupon.coupon_code);

  const hasDiscount =
    coupon.discount_value !== null && coupon.discount_value !== undefined;

  const hasSalePrice =
    coupon.sale_price !== null && coupon.sale_price !== undefined;

  const hasOriginalPrice =
    coupon.original_price !== null && coupon.original_price !== undefined;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {/* VERIFIED */}
        {coupon.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow">
            ✓ Verified
          </span>
        )}

        {/* FAVORITE */}
        <button
          type="button"
          aria-label="Save coupon"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow"
        >
          ♡
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* DISCOUNT */}
        <div className="flex flex-wrap items-center gap-2">
          {hasDiscount && (
            <span className="text-sm font-bold text-red-600">
              {coupon.discount_value}% OFF
            </span>
          )}

          {coupon.badge && (
            <span className="text-sm font-medium text-green-600">
              {coupon.badge}
            </span>
          )}

          {coupon.is_exclusive && (
            <span className="rounded bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
              Exclusive
            </span>
          )}
        </div>

        {/* PRICE */}
        {(hasSalePrice || hasOriginalPrice) && (
          <div className="mt-2 flex items-baseline gap-2">
            {hasSalePrice && (
              <span className="text-xl font-bold text-gray-900">
                ${Number(coupon.sale_price).toFixed(2)}
              </span>
            )}

            {hasOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${Number(coupon.original_price).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* TITLE */}
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-gray-900">
          {coupon.title}
        </h3>

        {/* STORE */}
        {coupon.store_name && (
          <p className="mt-1 text-sm text-gray-500">{coupon.store_name}</p>
        )}

        {/* CODE */}
        <div className="mt-4 flex">
          {hasCode && (
            <span className="rounded-l-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
              {coupon.coupon_code!.slice(0, 4)}••
            </span>
          )}

          {coupon.slug ? (
            <Link
              href={`/coupons/${coupon.slug}`}
              className={`bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 ${
                hasCode ? "rounded-r-lg" : "rounded-lg"
              }`}
            >
              {hasCode ? "GET CODE" : "GET DEAL"}
            </Link>
          ) : (
            <span
              className={`bg-gray-400 px-4 py-2 text-sm font-bold text-white ${
                hasCode ? "rounded-r-lg" : "rounded-lg"
              }`}
            >
              {hasCode ? "GET CODE" : "GET DEAL"}
            </span>
          )}
        </div>

        {/* DETAILS */}
        <div className="mt-4 space-y-1 text-xs text-gray-500">
          {coupon.rating !== null &&
            coupon.review_count !== null &&
            coupon.review_count > 0 && (
              <div>
                ⭐ {coupon.rating} ({coupon.review_count})
              </div>
            )}

          {coupon.popularity_count !== null && coupon.popularity_count > 0 && (
            <div>🔥 {coupon.popularity_count}+ clicks</div>
          )}

          {coupon.sold_text && <div>{coupon.sold_text}</div>}

          {coupon.shipping_text && <div>🚚 {coupon.shipping_text}</div>}

          {coupon.verified && (
            <div className="font-semibold text-green-600">✓ Verified Deal</div>
          )}

          {coupon.expires_at && <div>Expires: {coupon.expires_at}</div>}
        </div>
      </div>
    </article>
  );
}
