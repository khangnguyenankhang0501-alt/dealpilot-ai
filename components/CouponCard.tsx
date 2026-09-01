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
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
      {/* IMAGE / BADGE */}
      <div className="relative h-48 w-full overflow-hidden bg-white p-4 flex items-center justify-center shrink-0">
        {hasImage ? (
          <Image
            src={coupon.image_url!}
            alt={coupon.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}

        {/* VERIFIED */}
        {coupon.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
            Verified
          </span>
        )}

        {/* EXCLUSIVE */}
        {coupon.is_exclusive && (
          <span className="absolute bottom-3 left-3 rounded-md bg-purple-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            Exclusive
          </span>
        )}

        {/* FAVORITE BUTTON */}
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            couponId={String(coupon.id)}
            onChange={onFavoriteChange}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* DISCOUNT / BADGE */}
          <div className="mb-3 flex min-h-[24px] flex-wrap items-center gap-2">
            {hasDiscount && (
              <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-bold text-red-600">
                {coupon.discount_value}% OFF
              </span>
            )}

            {coupon.badge && (
              <span className="rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700">
                {coupon.badge}
              </span>
            )}
          </div>

          {/* PRICES */}
          {hasPrice && (
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-gray-900">
                ${Number(coupon.sale_price).toFixed(2)}
              </span>

              {hasOriginalPrice && (
                <span className="text-sm font-medium text-gray-400 line-through">
                  ${Number(coupon.original_price).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* TITLE */}
          <h3 className="mb-2 min-h-[44px] line-clamp-2 text-sm font-bold leading-5 text-gray-900 sm:text-base sm:leading-6">
            {coupon.title}
          </h3>

          {/* STORE */}
          {coupon.stores && (
            <div className="mb-4">
              <Link
                href={`/stores/${coupon.stores.slug}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                {coupon.stores.logo_url ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-md border bg-white shrink-0">
                    <Image
                      src={coupon.stores.logo_url}
                      alt={coupon.stores.name}
                      fill
                      sizes="24px"
                      className="object-contain p-1"
                    />
                  </div>
                ) : null}
                <span className="truncate">{coupon.stores.name}</span>
              </Link>
            </div>
          )}
        </div>

        <div>
          {/* CTA - Đã cố định bố cục gọn gàng, nút Get Code luôn chuẩn đẹp */}
          <div className="mt-4 flex w-full items-center gap-2">
            {hasCode ? (
              <>
                <div className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border border-green-300 bg-green-50 px-2 text-xs font-bold tracking-wider text-green-700">
                  <span className="truncate">
                    {coupon.coupon_code!.slice(0, 4)}••••
                  </span>
                </div>
                <div className="shrink-0 w-auto">
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
          <div className="mt-4 space-y-1.5 text-xs text-gray-500">
            {coupon.verified && (
              <div className="font-semibold text-green-600">Verified Deal</div>
            )}

            {coupon.rating !== null && coupon.rating !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span>{Number(coupon.rating).toFixed(1)}</span>
                {coupon.review_count !== null && (
                  <span>({coupon.review_count} reviews)</span>
                )}
              </div>
            )}

            {coupon.popularity_count !== null &&
              coupon.popularity_count > 0 && (
                <div>🔥 {coupon.popularity_count} clicks</div>
              )}

            {coupon.shipping_text && <div>{coupon.shipping_text}</div>}
            {coupon.sold_text && <div>{coupon.sold_text}</div>}
            {coupon.expires_at && <div>Expires: {coupon.expires_at}</div>}
          </div>
        </div>
      </div>
    </article>
  );
}
