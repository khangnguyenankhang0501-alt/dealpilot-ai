import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import HomeTrendingMoreFromStore from "@/components/HomeTrendingMoreFromStore";
import { supabase } from "@/lib/supabaseClient";

type Coupon = {
  id: string;
  title?: string | null;
  slug?: string | null;
  store_name?: string | null;
  store_id?: string | null;

  image_url?: string | null;

  discount_value?: number | string | null;

  original_price?: number | string | null;
  sale_price?: number | string | null;

  expires_at?: string | null;

  verified?: boolean | null;

  rating?: number | string | null;
  review_count?: number | string | null;

  popularity_count?: number | string | null;
  click_count?: number | string | null;

  badge?: string | null;
  is_exclusive?: boolean | null;
};

type Store = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
};

function getDiscount(value?: number | string | null) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0;
  }

  return numberValue;
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

function getCouponHref(coupon: Coupon) {
  return coupon.slug ? `/coupons/${coupon.slug}` : "/coupons";
}

function getStore(coupon: Coupon, stores: Store[]) {
  const name = coupon.store_name?.trim().toLowerCase();

  if (!name) {
    return null;
  }

  return (
    stores.find((store) => store.name?.trim().toLowerCase() === name) || null
  );
}

export default async function HomeTrending() {
  const now = new Date();

  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const currentTime = now.toISOString();

  /*
   * First priority:
   * fresh coupons from the last 7 days.
   */
  const { data: recentRows, error: recentError } = await supabase
    .from("coupons")
    .select("*")
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${currentTime}`)
    .gte("created_at", sevenDaysAgo)
    .order("popularity_count", {
      ascending: false,
    })
    .order("click_count", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  /*
   * Fallback:
   * fill the remaining slots with active popular coupons.
   */
  let coupons = (recentRows || []) as Coupon[];

  if (!recentError && coupons.length < 8) {
    const existingIds = new Set(coupons.map((coupon) => coupon.id));

    const { data: fallbackRows } = await supabase
      .from("coupons")
      .select("*")
      .eq("status", "Active")
      .or(`expires_at.is.null,expires_at.gte.${currentTime}`)
      .order("popularity_count", {
        ascending: false,
      })
      .order("click_count", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    for (const coupon of (fallbackRows || []) as Coupon[]) {
      if (existingIds.has(coupon.id)) {
        continue;
      }

      coupons.push(coupon);
      existingIds.add(coupon.id);

      if (coupons.length >= 8) {
        break;
      }
    }
  }

  /*
   * Load store logos.
   */
  const { data: storeRows } = await supabase
    .from("stores")
    .select("id,name,slug,logo_url");

  const stores = (storeRows || []) as Store[];

  /*
   * Attach nested store data so the existing
   * CouponCard continues to display logos.
   */
  const preparedCoupons = coupons.map((coupon) => {
    const store = getStore(coupon, stores);

    return {
      ...coupon,
      stores: store
        ? {
            id: store.id,
            name: store.name,
            slug: store.slug,
            logo_url: store.logo_url,
          }
        : null,
    };
  });

  if (preparedCoupons.length === 0) {
    return null;
  }

  /*
   * First item becomes the large trending feature.
   */
  const lead = preparedCoupons[0];

  /*
   * Remaining items become compact cards.
   */
  const secondary = preparedCoupons.slice(1, 5);

  const leadStore = getStore(lead, stores);

  const leadDiscount = getDiscount(lead.discount_value);

  const leadSalePrice = formatPrice(lead.sale_price);

  const leadOriginalPrice = formatPrice(lead.original_price);

  /*
   * MORE FROM THIS STORE
   */
  let moreFromStore: Coupon[] = [];

  if (lead.store_id) {
    const { data: sameStoreRows } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_id", lead.store_id)
      .eq("status", "Active")
      .or(`expires_at.is.null,expires_at.gte.${currentTime}`)
      .neq("id", lead.id)
      .order("popularity_count", {
        ascending: false,
      })
      .order("click_count", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(8);

    moreFromStore = (sameStoreRows || []) as Coupon[];
  } else if (lead.store_name) {
    const { data: sameStoreRows } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_name", lead.store_name)
      .eq("status", "Active")
      .or(`expires_at.is.null,expires_at.gte.${currentTime}`)
      .neq("id", lead.id)
      .order("popularity_count", {
        ascending: false,
      })
      .order("click_count", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(8);

    moreFromStore = (sameStoreRows || []) as Coupon[];
  }

  const moreFromStoreItems = moreFromStore
    .filter((coupon) => coupon.id !== lead.id && Boolean(coupon.slug))
    .slice(0, 3);

  return (
    <section className="relative mt-10 overflow-hidden rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_10%_10%,rgba(167,243,208,0.45),transparent_26%),radial-gradient(circle_at_92%_14%,rgba(186,230,253,0.34),transparent_24%),linear-gradient(180deg,#f8fffc_0%,#ffffff_42%,#f7fcff_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
      {/* SOFT BACKGROUND BLOBS */}

      <div className="pointer-events-none absolute -left-20 top-20 h-52 w-52 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />

      {/* ================================================= */}
      {/* HEADER                                          */}
      {/* ================================================= */}

      <div className="relative z-10 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            Trending now
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Deals people are watching
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Fresh deals getting attention right now.
          </p>
        </div>

        <Link
          href="/trending"
          className="
            relative
            z-10
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            border-emerald-100
            bg-white/80
            px-3
            py-2
            text-[10px]
            font-black
            uppercase
            tracking-wide
            text-emerald-600
            shadow-sm
            backdrop-blur
            transition
            hover:border-emerald-200
            hover:bg-white
            hover:text-emerald-700
          "
        >
          View all
          <span className="text-sm">→</span>
        </Link>
      </div>

      {/* ================================================= */}
      {/* DESKTOP                                         */}
      {/* ================================================= */}

      <div className="relative z-10 mt-5 hidden gap-4 lg:grid lg:grid-cols-[1.15fr_2fr]">
        {/* ================================================= */}
        {/* LEFT COLUMN                                     */}
        {/* ================================================= */}

        <div className="min-w-0">
          {/* LEAD */}

          <Link
            href={getCouponHref(lead)}
            className="
              group
              relative
              block
              min-h-[430px]
              overflow-hidden
              rounded-[26px]
              border
              border-white/80
              bg-[linear-gradient(135deg,rgba(236,253,245,0.95)_0%,rgba(255,255,255,0.98)_48%,rgba(236,254,255,0.95)_100%)]
              shadow-[0_16px_45px_rgba(15,23,42,0.08)]
              ring-1
              ring-emerald-100/50
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]
            "
          >
            {/* TOP GLOW */}

            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />

            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-200/30 blur-2xl" />

            {/* Top label */}

            <div className="relative z-10 flex items-center justify-between px-5 pt-5">
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(16,185,129,0.22)]">
                #1 Trending
              </span>

              {lead.verified === true ? (
                <span className="rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1 text-[8px] font-black text-emerald-600 shadow-sm">
                  ✓ Verified
                </span>
              ) : null}
            </div>

            {/* Product */}

            <div className="relative z-10 mx-5 mt-5 flex h-[210px] items-center justify-center overflow-hidden rounded-[20px] border border-white/80 bg-white/80 shadow-inner backdrop-blur-sm">
              {lead.image_url ? (
                <img
                  src={lead.image_url}
                  alt={lead.title || "Trending deal"}
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

              {leadDiscount > 0 ? (
                <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white shadow-sm">
                  {leadDiscount}% OFF
                </span>
              ) : null}
            </div>

            {/* Store */}

            <div className="relative z-10 px-5 pt-4">
              <div className="flex items-center gap-2">
                {leadStore?.logo_url ? (
                  <img
                    src={leadStore.logo_url}
                    alt={leadStore.name || lead.store_name || "Store"}
                    className="h-6 w-6 rounded-md bg-white object-contain p-0.5 ring-1 ring-slate-100"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[9px] font-black text-slate-500 ring-1 ring-slate-100">
                    {(lead.store_name || "S").trim().charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="truncate text-[10px] font-bold text-slate-500">
                  {lead.store_name || "Store"}
                </span>
              </div>

              <h3 className="mt-2 line-clamp-2 text-[16px] font-black leading-5 text-slate-950">
                {lead.title || "Trending deal"}
              </h3>

              {/* Price */}

              <div className="mt-3 flex items-end gap-2">
                {leadSalePrice ? (
                  <span className="text-2xl font-black leading-none tracking-tight text-slate-950">
                    {leadSalePrice}
                  </span>
                ) : null}

                {leadOriginalPrice ? (
                  <span className="pb-0.5 text-[10px] font-medium text-slate-400 line-through">
                    {leadOriginalPrice}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <span className="text-[9px] font-semibold text-slate-400">
                  Trending on DealPilot
                </span>
              </div>
            </div>
          </Link>

          {/* MORE FROM THIS STORE */}

          <HomeTrendingMoreFromStore
            storeName={lead.store_name || leadStore?.name || "Store"}
            storeSlug={leadStore?.slug}
            items={moreFromStoreItems}
          />
        </div>

        {/* ================================================= */}
        {/* FOUR TRENDING CARDS                            */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 gap-4">
          {secondary.map((coupon) => (
            <div key={coupon.id} className="min-w-0">
              <CouponCard coupon={coupon} />
            </div>
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* MOBILE / TABLET                                 */}
      {/* ================================================= */}

      <div className="relative z-10 mt-5 lg:hidden">
        {/* Lead */}

        <Link
          href={getCouponHref(lead)}
          className="
            group
            relative
            block
            overflow-hidden
            rounded-[24px]
            border
            border-white/80
            bg-[linear-gradient(135deg,rgba(236,253,245,0.96)_0%,rgba(255,255,255,0.98)_48%,rgba(236,254,255,0.96)_100%)]
            p-4
            shadow-[0_14px_40px_rgba(15,23,42,0.08)]
            ring-1
            ring-emerald-100/50
          "
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">
              #1 Trending
            </span>

            {lead.verified === true ? (
              <span className="rounded-full border border-emerald-100 bg-white/90 px-2 py-1 text-[8px] font-black text-emerald-600 shadow-sm">
                ✓ Verified
              </span>
            ) : null}
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-[1fr_130px] items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {leadStore?.logo_url ? (
                  <img
                    src={leadStore.logo_url}
                    alt={leadStore.name || lead.store_name || "Store"}
                    className="h-5 w-5 rounded bg-white object-contain p-0.5 ring-1 ring-slate-100"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[8px] font-black text-slate-500">
                    {(lead.store_name || "S").trim().charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="truncate text-[9px] font-bold text-slate-500">
                  {lead.store_name || "Store"}
                </span>
              </div>

              <h3 className="mt-2 line-clamp-3 text-[14px] font-black leading-5 text-slate-950">
                {lead.title || "Trending deal"}
              </h3>

              {leadDiscount > 0 ? (
                <div className="mt-2 text-[24px] font-black leading-none tracking-tight text-emerald-600">
                  {leadDiscount}% OFF
                </div>
              ) : null}

              {leadSalePrice ? (
                <div className="mt-2 text-lg font-black text-slate-950">
                  {leadSalePrice}
                </div>
              ) : null}
            </div>

            <div className="flex h-[130px] items-center justify-center overflow-hidden rounded-[16px] border border-white/80 bg-white/80 shadow-inner">
              {lead.image_url ? (
                <img
                  src={lead.image_url}
                  alt={lead.title || "Trending deal"}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-4xl">🏷️</span>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-4 text-center text-[9px] font-semibold text-slate-400">
            Trending on DealPilot
          </div>
        </Link>

        {/* More from this store */}

        <HomeTrendingMoreFromStore
          storeName={lead.store_name || leadStore?.name || "Store"}
          storeSlug={leadStore?.slug}
          items={moreFromStoreItems}
        />

        {/* Horizontal cards */}

        {secondary.length > 0 ? (
          <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3">
              {secondary.map((coupon) => (
                <div
                  key={coupon.id}
                  className="w-[245px] min-w-[245px] flex-none"
                >
                  <CouponCard coupon={coupon} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Link
          href="/trending"
          className="
            mt-4
            flex
            h-10
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-slate-200
            bg-white/90
            text-[10px]
            font-black
            uppercase
            tracking-wide
            text-slate-600
            shadow-sm
            transition
            hover:border-emerald-200
            hover:bg-white
            hover:text-emerald-700
          "
        >
          View all trending deals
          <span className="text-sm">→</span>
        </Link>
      </div>
    </section>
  );
}
