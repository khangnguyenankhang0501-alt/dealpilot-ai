import Image from "next/image";
import Link from "next/link";

interface MiniStoreDeal {
  id: string;
  title?: string | null;
  slug?: string | null;
  image_url?: string | null;
  discount_value?: number | string | null;
  original_price?: number | string | null;
  sale_price?: number | string | null;
  store_name?: string | null;
}

interface HomeTrendingMoreFromStoreProps {
  storeName: string;
  storeSlug?: string | null;
  items: MiniStoreDeal[];
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

export default function HomeTrendingMoreFromStore({
  storeName,
  items,
}: HomeTrendingMoreFromStoreProps) {
  const visibleItems = items.filter((item) => Boolean(item.slug)).slice(0, 3);

  if (visibleItems.length === 0) {
    return null;
  }

  const storeInitial = storeName.trim().charAt(0).toUpperCase() || "S";

  return (
    <section className="mt-4 border-t border-slate-200 pt-4">
      {/* HEADER */}

      <div className="flex items-center gap-2.5 px-1">
        <span
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            bg-white
            text-[10px]
            font-black
            text-slate-600
          "
        >
          {storeInitial}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[12px] font-black text-slate-900 sm:text-[13px]">
            More from this store
          </p>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
            {storeName}
          </p>
        </div>
      </div>

      {/* MINI DEAL LIST */}

      <div className="mt-3 space-y-2.5">
        {visibleItems.map((item) => {
          const discount = formatDiscount(item.discount_value);

          const salePrice = formatPrice(item.sale_price);

          const originalPrice = formatPrice(item.original_price);

          return (
            <Link
              key={item.id}
              href={`/coupons/${item.slug}`}
              className="
                group
                flex
                min-h-[66px]
                min-w-0
                items-center
                gap-3
                rounded-[14px]
                border
                border-slate-200
                bg-white
                px-2.5
                py-2.5
                shadow-[0_4px_16px_rgba(15,23,42,0.03)]
                transition
                hover:-translate-y-0.5
                hover:border-emerald-200
                hover:bg-emerald-50/30
                hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]
              "
            >
              {/* IMAGE */}

              <div
                className="
                  relative
                  h-14
                  w-14
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                "
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title || "Deal"}
                    fill
                    sizes="56px"
                    className="
                      object-contain
                      p-1.5
                      transition-transform
                      duration-300
                      group-hover:scale-105
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
                      text-lg
                    "
                  >
                    🏷️
                  </div>
                )}
              </div>

              {/* CONTENT */}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  {discount ? (
                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-emerald-500
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-black
                        tracking-wide
                        text-white
                      "
                    >
                      {discount}
                    </span>
                  ) : null}

                  <span
                    className="
                      min-w-0
                      truncate
                      text-[9px]
                      font-bold
                      text-slate-400
                    "
                  >
                    {item.store_name || storeName}
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-[10px]
                    font-bold
                    leading-[14px]
                    text-slate-800
                    sm:text-[11px]
                    sm:leading-[15px]
                  "
                >
                  {item.title || "Special Deal"}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  {salePrice ? (
                    <span
                      className="
                        text-[13px]
                        font-black
                        leading-none
                        text-slate-950
                      "
                    >
                      {salePrice}
                    </span>
                  ) : null}

                  {originalPrice ? (
                    <span
                      className="
                        text-[9px]
                        font-medium
                        text-slate-400
                        line-through
                      "
                    >
                      {originalPrice}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* ARROW */}

              <span
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-base
                  font-black
                  text-slate-300
                  transition
                  group-hover:bg-emerald-50
                  group-hover:text-emerald-500
                "
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
