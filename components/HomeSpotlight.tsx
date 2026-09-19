import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Coupon = {
  id: string;
  title?: string | null;
  slug?: string | null;
  store_name?: string | null;
  image_url?: string | null;
  discount_value?: number | string | null;
  original_price?: number | string | null;
  sale_price?: number | string | null;
  expires_at?: string | null;
  verified?: boolean | null;
};

type Store = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
};

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

function formatDiscount(value?: number | string | null) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "DEAL";
  }

  return `${numberValue}% OFF`;
}

function getStore(coupon: Coupon, stores: Store[]) {
  const storeName = coupon.store_name?.trim().toLowerCase();

  if (!storeName) {
    return null;
  }

  return (
    stores.find((store) => store.name?.trim().toLowerCase() === storeName) ||
    null
  );
}

function getHref(coupon: Coupon) {
  return coupon.slug ? `/coupons/${coupon.slug}` : "/deals";
}

export default async function HomeSpotlight() {
  const now = new Date().toISOString();

  /*
   * Featured deal:
   * Prefer verified + higher discount + newer coupons.
   */
  const { data: featuredRows } = await supabase
    .from("coupons")
    .select(
      "id,title,slug,store_name,image_url,discount_value,original_price,sale_price,expires_at,verified",
    )
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("verified", {
      ascending: false,
    })
    .order("discount_value", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  /*
   * Flash sale:
   * Find active deals that expire soonest.
   */
  const { data: flashRows } = await supabase
    .from("coupons")
    .select(
      "id,title,slug,store_name,image_url,discount_value,original_price,sale_price,expires_at,verified",
    )
    .eq("status", "Active")
    .not("expires_at", "is", null)
    .gte("expires_at", now)
    .order("expires_at", {
      ascending: true,
    })
    .limit(6);

  /*
   * Stores for logos.
   */
  const { data: storeRows } = await supabase
    .from("stores")
    .select("id,name,slug,logo_url");

  const stores = (storeRows || []) as Store[];

  const featured = ((featuredRows || []) as Coupon[])[0] || null;

  const featuredFlash = ((flashRows || []) as Coupon[])[0] || featured || null;

  if (!featured && !featuredFlash) {
    return null;
  }

  const featuredStore = featured ? getStore(featured, stores) : null;

  const flashStore = featuredFlash ? getStore(featuredFlash, stores) : null;

  const featuredSalePrice = featured ? formatPrice(featured.sale_price) : null;

  const featuredOriginalPrice = featured
    ? formatPrice(featured.original_price)
    : null;

  const featuredDiscount = featured
    ? formatDiscount(featured.discount_value)
    : "DEAL";

  const flashSalePrice = featuredFlash
    ? formatPrice(featuredFlash.sale_price)
    : null;

  const flashOriginalPrice = featuredFlash
    ? formatPrice(featuredFlash.original_price)
    : null;

  const flashDiscount = featuredFlash
    ? formatDiscount(featuredFlash.discount_value)
    : "DEAL";

  return (
    <section className="mt-10">
      {/* ================================================= */}
      {/* DESKTOP                                      */}
      {/* ================================================= */}

      <div className="hidden gap-4 lg:grid lg:grid-cols-[2fr_1fr]">
        {/* ================================================= */}
        {/* FEATURED DEAL                                   */}
        {/* ================================================= */}

        {featured ? (
          <Link
            href={getHref(featured)}
            className="
              group
              relative
              min-h-[300px]
              overflow-hidden
              rounded-[24px]
              border
              border-emerald-100
              bg-gradient-to-br
              from-emerald-50
              via-white
              to-cyan-50
              p-6
              shadow-[0_15px_45px_rgba(15,23,42,0.06)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)]
            "
          >
            {/* Soft glow */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />

            {/* Text area */}

            <div className="relative z-10 max-w-[48%]">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600 shadow-sm">
                  Featured deal
                </span>

                {featured.verified === true ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black text-emerald-700">
                    ✓ Verified
                  </span>
                ) : null}
              </div>

              {featuredStore?.logo_url ? (
                <img
                  src={featuredStore.logo_url}
                  alt={featuredStore.name || featured.store_name || "Store"}
                  className="mt-7 h-7 w-28 object-contain object-left"
                />
              ) : (
                <div className="mt-7 text-xs font-black text-slate-500">
                  {featured.store_name || "Store"}
                </div>
              )}

              <div className="mt-5 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-600">
                Up to
              </div>

              <div className="mt-0.5 text-[42px] font-black leading-none tracking-[-0.05em] text-slate-950">
                {featuredDiscount}
              </div>

              <h2 className="mt-4 line-clamp-2 text-[17px] font-black leading-6 text-slate-900">
                {featured.title || "Featured deal"}
              </h2>

              <div className="mt-5 flex items-center gap-3">
                <span
                  className="
                    flex
                    h-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500
                    px-4
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wide
                    text-white
                    transition-colors
                    group-hover:bg-emerald-600
                  "
                >
                  Shop now →
                </span>

                {featuredSalePrice ? (
                  <span className="text-base font-black text-slate-900">
                    {featuredSalePrice}
                  </span>
                ) : null}

                {featuredOriginalPrice ? (
                  <span className="text-[10px] font-medium text-slate-400 line-through">
                    {featuredOriginalPrice}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Product visual */}

            <div className="absolute right-5 top-1/2 flex h-[260px] w-[48%] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[22px] bg-white/70">
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.title || "Featured product"}
                  className="
                    h-full
                    w-full
                    object-contain
                    p-5
                    transition-transform
                    duration-500
                    group-hover:scale-[1.05]
                  "
                />
              ) : (
                <span className="text-6xl">🏷️</span>
              )}

              <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white shadow-sm">
                {featuredDiscount}
              </div>
            </div>
          </Link>
        ) : null}

        {/* ================================================= */}
        {/* FLASH SALE                                      */}
        {/* ================================================= */}

        {featuredFlash ? (
          <Link
            href={getHref(featuredFlash)}
            className="
              group
              relative
              min-h-[300px]
              overflow-hidden
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_15px_45px_rgba(15,23,42,0.06)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)]
            "
          >
            {/* Background */}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/70" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">
                  <span className="text-base">⚡</span>
                  Flash sale
                </span>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black text-emerald-700">
                  LIVE
                </span>
              </div>

              <p className="mt-2 text-[10px] font-medium text-slate-400">
                Limited-time deal
              </p>

              <div className="mt-4 flex items-center gap-2">
                {flashStore?.logo_url ? (
                  <img
                    src={flashStore.logo_url}
                    alt={flashStore.name || featuredFlash.store_name || "Store"}
                    className="h-6 w-20 object-contain object-left"
                  />
                ) : (
                  <span className="text-[10px] font-black text-slate-500">
                    {featuredFlash.store_name || "Store"}
                  </span>
                )}
              </div>

              <h3 className="mt-3 line-clamp-2 text-[14px] font-black leading-5 text-slate-900">
                {featuredFlash.title || "Flash deal"}
              </h3>
            </div>

            {/* Product */}

            <div className="relative z-10 mt-4 flex h-[125px] items-center justify-center overflow-hidden rounded-[16px] bg-slate-50">
              {featuredFlash.image_url ? (
                <img
                  src={featuredFlash.image_url}
                  alt={featuredFlash.title || "Flash sale"}
                  className="
                    h-full
                    w-full
                    object-contain
                    p-3
                    transition-transform
                    duration-500
                    group-hover:scale-[1.05]
                  "
                />
              ) : (
                <span className="text-4xl">⚡</span>
              )}

              <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-500 px-2 py-1 text-[8px] font-black text-white">
                {flashDiscount}
              </span>
            </div>

            {/* Price */}

            <div className="relative z-10 mt-3 flex items-end gap-2">
              {flashSalePrice ? (
                <span className="text-xl font-black leading-none text-slate-950">
                  {flashSalePrice}
                </span>
              ) : null}

              {flashOriginalPrice ? (
                <span className="pb-0.5 text-[9px] font-medium text-slate-400 line-through">
                  {flashOriginalPrice}
                </span>
              ) : null}
            </div>

            {/* CTA */}

            <div className="relative z-10 mt-4 flex h-10 items-center justify-between rounded-xl bg-slate-50 px-3">
              <span className="text-[9px] font-bold text-slate-500">
                Grab it before it ends
              </span>

              <span className="text-[10px] font-black text-emerald-600">
                Shop →
              </span>
            </div>
          </Link>
        ) : null}
      </div>

      {/* ================================================= */}
      {/* MOBILE                                         */}
      {/* ================================================= */}

      <div className="grid gap-3 lg:hidden">
        {/* Featured */}

        {featured ? (
          <Link
            href={getHref(featured)}
            className="
              relative
              overflow-hidden
              rounded-[22px]
              border
              border-emerald-100
              bg-gradient-to-br
              from-emerald-50
              via-white
              to-cyan-50
              p-4
              shadow-[0_12px_35px_rgba(15,23,42,0.06)]
            "
          >
            <div className="relative z-10">
              <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-600 shadow-sm">
                Featured deal
              </span>

              <h2 className="mt-3 max-w-[68%] text-[17px] font-black leading-5 text-slate-900">
                {featured.title || "Featured deal"}
              </h2>

              <div className="mt-3">
                <span className="text-[31px] font-black leading-none tracking-[-0.04em] text-slate-950">
                  {featuredDiscount}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="flex h-9 items-center rounded-lg bg-emerald-500 px-3 text-[9px] font-black uppercase tracking-wide text-white">
                  Shop now →
                </span>

                {featuredSalePrice ? (
                  <span className="text-sm font-black text-slate-900">
                    {featuredSalePrice}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="absolute right-2 top-2 h-[150px] w-[48%] overflow-hidden rounded-[16px] bg-white/70">
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.title || "Featured deal"}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🏷️
                </div>
              )}
            </div>
          </Link>
        ) : null}

        {/* Flash sale */}

        {featuredFlash ? (
          <Link
            href={getHref(featuredFlash)}
            className="
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-[0_12px_35px_rgba(15,23,42,0.06)]
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">
                  <span>⚡</span>
                  Flash sale
                </div>

                <p className="mt-1 text-[9px] font-medium text-slate-400">
                  Limited-time deal
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black text-emerald-700">
                LIVE
              </span>
            </div>

            <div className="mt-3 flex gap-3">
              <div className="relative flex h-[105px] w-[105px] shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-slate-50">
                {featuredFlash.image_url ? (
                  <img
                    src={featuredFlash.image_url}
                    alt={featuredFlash.title || "Flash deal"}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl">⚡</span>
                )}

                <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-1.5 py-1 text-[7px] font-black text-white">
                  {flashDiscount}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-3 text-[12px] font-black leading-4.5 text-slate-900">
                  {featuredFlash.title || "Flash deal"}
                </h3>

                <div className="mt-3 flex items-end gap-2">
                  {flashSalePrice ? (
                    <span className="text-lg font-black text-slate-950">
                      {flashSalePrice}
                    </span>
                  ) : null}

                  {flashOriginalPrice ? (
                    <span className="pb-0.5 text-[9px] font-medium text-slate-400 line-through">
                      {flashOriginalPrice}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 text-[9px] font-black text-emerald-600">
                  Shop now →
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
