import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import HomeTrendingMoreFromStore from "@/components/HomeTrendingMoreFromStore";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

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

  verified?: boolean | null;

  rating?: number | string | null;
  review_count?: number | string | null;

  popularity_count?: number | string | null;
  click_count?: number | string | null;

  badge?: string | null;
  is_exclusive?: boolean | null;

  expires_at?: string | null;
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

function getStore(coupon: Coupon, stores: Store[]) {
  const key = coupon.store_name?.trim().toLowerCase();

  if (!key) {
    return null;
  }

  return (
    stores.find((store) => store.name?.trim().toLowerCase() === key) || null
  );
}

function getHref(coupon: Coupon) {
  return coupon.slug ? `/coupons/${coupon.slug}` : "/coupons";
}

export default async function HomeFeatured() {
  const now = new Date().toISOString();

  /*
   * =========================================================
   * GET FEATURED COUPONS
   *
   * Priority:
   * 1. Exclusive
   * 2. Verified
   * 3. Clicks
   * 4. Popularity
   * 5. Discount
   * =========================================================
   */

  const { data: couponRows, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("is_exclusive", {
      ascending: false,
      nullsFirst: false,
    })
    .order("verified", {
      ascending: false,
      nullsFirst: false,
    })
    .order("click_count", {
      ascending: false,
      nullsFirst: false,
    })
    .order("popularity_count", {
      ascending: false,
      nullsFirst: false,
    })
    .order("discount_value", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(10);

  /*
   * =========================================================
   * ERROR HANDLING
   * =========================================================
   */

  if (error) {
    console.error("Error fetching featured coupons:", error);
  }

  if (!couponRows || couponRows.length === 0) {
    return null;
  }

  /*
   * =========================================================
   * LOAD STORES
   * =========================================================
   */

  const { data: storeRows } = await supabase
    .from("stores")
    .select("id,name,slug,logo_url");

  const stores = (storeRows || []) as Store[];

  /*
   * =========================================================
   * PREPARE COUPONS
   * =========================================================
   */

  const coupons = (couponRows as Coupon[]).map((coupon) => {
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

  /*
   * =========================================================
   * FEATURED + SECONDARY
   * =========================================================
   */

  const lead = coupons[0];

  const secondary = coupons.slice(1, 5);

  /*
   * =========================================================
   * LEAD STORE
   * =========================================================
   */

  const leadStore = getStore(lead, stores);

  const storeName = leadStore?.name || lead.store_name || "Store";

  const storeSlug = leadStore?.slug || null;

  const storeLogo = leadStore?.logo_url || null;

  /*
   * =========================================================
   * LEAD VALUES
   * =========================================================
   */

  const discount = getDiscount(lead.discount_value);

  const salePrice = formatPrice(lead.sale_price);

  const originalPrice = formatPrice(lead.original_price);

  const rating = Number(lead.rating);

  const reviews = Number(lead.review_count);

  const hasRating = Number.isFinite(rating) && rating > 0;

  const hasReviews = Number.isFinite(reviews) && reviews > 0;

  /*
   * =========================================================
   * MORE FROM THIS STORE
   *
   * Fetch 3 additional active coupons from the same store.
   * Prefer store_id when available.
   * Fall back to store_name when necessary.
   * =========================================================
   */

  let moreFromStore: Coupon[] = [];

  if (lead.store_id) {
    const { data: sameStoreRows } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_id", lead.store_id)
      .eq("status", "Active")
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .neq("id", lead.id)
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("popularity_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(8);

    moreFromStore = (sameStoreRows || []) as Coupon[];
  } else if (lead.store_name) {
    const { data: sameStoreRows } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_name", lead.store_name)
      .eq("status", "Active")
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .neq("id", lead.id)
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("popularity_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(8);

    moreFromStore = (sameStoreRows || []) as Coupon[];
  }

  const moreFromStoreItems = moreFromStore
    .filter((coupon) => coupon.id !== lead.id && Boolean(coupon.slug))
    .slice(0, 3);

  return (
    <section
      className="
        relative
        mt-10
        w-full
        overflow-hidden
        rounded-[30px]
        border
        border-slate-200/70
        bg-[radial-gradient(circle_at_10%_8%,rgba(167,243,208,0.45),transparent_26%),radial-gradient(circle_at_92%_12%,rgba(186,230,253,0.34),transparent_25%),linear-gradient(180deg,#f8fffc_0%,#ffffff_42%,#f7fcff_100%)]
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-7
        lg:py-7
      "
    >
      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-24
          top-16
          h-64
          w-64
          rounded-full
          bg-emerald-200/20
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          bottom-0
          h-64
          w-64
          rounded-full
          bg-cyan-200/20
          blur-3xl
        "
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          items-end
          justify-between
          gap-4
          px-1
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.18em]
              text-emerald-600
            "
          >
            Featured
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-2xl
            "
          >
            Deals worth a closer look
          </h2>

          <p
            className="
              mt-1
              text-xs
              font-medium
              text-slate-500
              sm:text-sm
            "
          >
            Hand-picked offers from our active coupon list.
          </p>
        </div>

        {/* ONLY ONE VIEW ALL */}

        <Link
          href="/deals"
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
            bg-white/85
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

      {/* =====================================================
          DESKTOP
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mt-5
          hidden
          gap-4
          lg:grid
          lg:grid-cols-[1.15fr_2fr]
        "
      >
        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="min-w-0">
          {/* FEATURED LEAD */}

          <Link
            href={getHref(lead)}
            className="
              group
              relative
              block
              min-h-[430px]
              overflow-hidden
              rounded-[26px]
              border
              border-white/80
              bg-[linear-gradient(135deg,rgba(236,253,245,0.96)_0%,rgba(255,255,255,0.98)_48%,rgba(236,254,255,0.96)_100%)]
              shadow-[0_16px_45px_rgba(15,23,42,0.08)]
              ring-1
              ring-emerald-100/50
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]
            "
          >
            {/* Decorative glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-36
                w-36
                rounded-full
                bg-emerald-200/30
                blur-2xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-10
                -left-10
                h-36
                w-36
                rounded-full
                bg-cyan-200/30
                blur-2xl
              "
            />

            {/* TOP LABEL */}

            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-between
                px-5
                pt-5
              "
            >
              <span
                className="
                  rounded-full
                  bg-emerald-500
                  px-2.5
                  py-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-white
                  shadow-[0_6px_18px_rgba(16,185,129,0.22)]
                "
              >
                Featured deal
              </span>

              {lead.is_exclusive === true ? (
                <span
                  className="
                    rounded-full
                    bg-slate-950
                    px-2.5
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.1em]
                    text-white
                  "
                >
                  Exclusive
                </span>
              ) : lead.verified === true ? (
                <span
                  className="
                    rounded-full
                    border
                    border-emerald-100
                    bg-white/90
                    px-2.5
                    py-1
                    text-[8px]
                    font-black
                    text-emerald-600
                    shadow-sm
                  "
                >
                  ✓ Verified
                </span>
              ) : null}
            </div>

            {/* PRODUCT IMAGE */}

            <div
              className="
                relative
                z-10
                mx-5
                mt-5
                flex
                h-[230px]
                items-center
                justify-center
                overflow-hidden
                rounded-[20px]
                border
                border-white/80
                bg-white/80
                shadow-inner
                backdrop-blur-sm
              "
            >
              {lead.image_url ? (
                <img
                  src={lead.image_url}
                  alt={lead.title || "Featured deal"}
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

              {discount > 0 ? (
                <span
                  className="
                    absolute
                    left-3
                    top-3
                    rounded-full
                    bg-emerald-500
                    px-2.5
                    py-1
                    text-[9px]
                    font-black
                    text-white
                    shadow-sm
                  "
                >
                  {discount}% OFF
                </span>
              ) : null}
            </div>

            {/* CONTENT */}

            <div className="relative z-10 px-5 pt-4">
              <div className="flex items-center gap-2">
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="
                      h-6
                      w-6
                      rounded-md
                      bg-white
                      object-contain
                      p-0.5
                      ring-1
                      ring-slate-100
                    "
                  />
                ) : (
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-md
                      bg-white
                      text-[9px]
                      font-black
                      text-slate-500
                      ring-1
                      ring-slate-100
                    "
                  >
                    {storeName.trim().charAt(0).toUpperCase()}
                  </span>
                )}

                <span
                  className="
                    truncate
                    text-[10px]
                    font-bold
                    text-slate-500
                  "
                >
                  {storeName}
                </span>

                {lead.verified === true ? (
                  <span
                    className="
                      ml-auto
                      text-[9px]
                      font-black
                      text-emerald-600
                    "
                  >
                    ✓ Verified
                  </span>
                ) : null}
              </div>

              <h3
                className="
                  mt-2
                  line-clamp-2
                  text-[16px]
                  font-black
                  leading-5
                  text-slate-950
                "
              >
                {lead.title || "Featured deal"}
              </h3>

              {/* RATING */}

              {hasRating || hasReviews ? (
                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-semibold
                    text-slate-400
                  "
                >
                  {hasRating ? (
                    <span className="text-amber-500">
                      ★ {rating.toFixed(1)}
                    </span>
                  ) : null}

                  {hasReviews ? (
                    <>
                      <span>·</span>

                      <span>{reviews.toLocaleString()} reviews</span>
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* PRICE */}

              <div
                className="
                  mt-4
                  flex
                  items-end
                  gap-2
                "
              >
                {salePrice ? (
                  <span
                    className="
                      text-2xl
                      font-black
                      leading-none
                      tracking-tight
                      text-slate-950
                    "
                  >
                    {salePrice}
                  </span>
                ) : null}

                {originalPrice ? (
                  <span
                    className="
                      pb-0.5
                      text-[10px]
                      font-medium
                      text-slate-400
                      line-through
                    "
                  >
                    {originalPrice}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <span
                  className="
                    text-[9px]
                    font-semibold
                    text-slate-400
                  "
                >
                  DealPilot featured pick
                </span>
              </div>
            </div>
          </Link>

          {/* =================================================
              MORE FROM THIS STORE
          ================================================= */}

          <HomeTrendingMoreFromStore
            storeName={storeName}
            storeSlug={storeSlug}
            items={moreFromStoreItems}
          />
        </div>

        {/* ===================================================
            SECONDARY CARDS
        =================================================== */}

        <div className="grid grid-cols-2 gap-4">
          {secondary.map((coupon) => (
            <div key={coupon.id} className="min-w-0">
              <CouponCard coupon={coupon} />
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          MOBILE
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mt-5
          lg:hidden
        "
      >
        {/* FEATURED LEAD */}

        <Link
          href={getHref(lead)}
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
          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-8
              h-28
              w-28
              rounded-full
              bg-emerald-200/30
              blur-2xl
            "
          />

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <span
              className="
                rounded-full
                bg-emerald-500
                px-2.5
                py-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-white
              "
            >
              Featured deal
            </span>

            {lead.is_exclusive === true ? (
              <span
                className="
                  rounded-full
                  bg-slate-950
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  uppercase
                  text-white
                "
              >
                Exclusive
              </span>
            ) : lead.verified === true ? (
              <span
                className="
                  rounded-full
                  border
                  border-emerald-100
                  bg-white/90
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  text-emerald-600
                  shadow-sm
                "
              >
                ✓ Verified
              </span>
            ) : null}
          </div>

          <div
            className="
              relative
              z-10
              mt-4
              grid
              grid-cols-[1fr_140px]
              items-center
              gap-3
            "
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="
                      h-5
                      w-5
                      rounded
                      bg-white
                      object-contain
                      p-0.5
                      ring-1
                      ring-slate-100
                    "
                  />
                ) : (
                  <span
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded
                      bg-white
                      text-[8px]
                      font-black
                      text-slate-500
                    "
                  >
                    {storeName.trim().charAt(0).toUpperCase()}
                  </span>
                )}

                <span
                  className="
                    truncate
                    text-[9px]
                    font-bold
                    text-slate-500
                  "
                >
                  {storeName}
                </span>
              </div>

              <h3
                className="
                  mt-2
                  line-clamp-3
                  text-[14px]
                  font-black
                  leading-5
                  text-slate-950
                "
              >
                {lead.title || "Featured deal"}
              </h3>

              {discount > 0 ? (
                <div
                  className="
                    mt-2
                    text-[23px]
                    font-black
                    leading-none
                    tracking-tight
                    text-emerald-600
                  "
                >
                  {discount}% OFF
                </div>
              ) : null}

              {salePrice ? (
                <div
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-950
                  "
                >
                  {salePrice}

                  {originalPrice ? (
                    <span
                      className="
                        ml-2
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
              ) : null}
            </div>

            <div
              className="
                relative
                flex
                h-[140px]
                items-center
                justify-center
                overflow-hidden
                rounded-[18px]
                border
                border-white/80
                bg-white/80
                shadow-inner
              "
            >
              {lead.image_url ? (
                <img
                  src={lead.image_url}
                  alt={lead.title || "Featured deal"}
                  className="
                    h-full
                    w-full
                    object-contain
                    p-2
                  "
                />
              ) : (
                <span className="text-4xl">🏷️</span>
              )}

              {discount > 0 ? (
                <span
                  className="
                    absolute
                    left-2
                    top-2
                    rounded-full
                    bg-emerald-500
                    px-1.5
                    py-1
                    text-[7px]
                    font-black
                    text-white
                  "
                >
                  {discount}% OFF
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="
              relative
              z-10
              mt-4
              text-center
              text-[9px]
              font-semibold
              text-slate-400
            "
          >
            DealPilot featured pick
          </div>
        </Link>

        {/* MORE FROM THIS STORE */}

        <HomeTrendingMoreFromStore
          storeName={storeName}
          storeSlug={storeSlug}
          items={moreFromStoreItems}
        />

        {/* SECONDARY */}

        {secondary.length > 0 ? (
          <div
            className="
              -mx-1
              mt-4
              overflow-x-auto
              px-1
              pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="flex gap-3">
              {secondary.map((coupon) => (
                <div
                  key={coupon.id}
                  className="
                    w-[245px]
                    min-w-[245px]
                    flex-none
                  "
                >
                  <CouponCard coupon={coupon} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
