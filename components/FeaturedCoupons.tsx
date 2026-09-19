import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

type FeaturedCoupon = {
  id: string;
  title?: string | null;
  slug?: string | null;
  store_name?: string | null;
  image_url?: string | null;

  discount_value?: number | string | null;

  original_price?: number | string | null;
  sale_price?: number | string | null;

  verified?: boolean | null;
  is_exclusive?: boolean | null;

  stores?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    logo_url?: string | null;
  } | null;
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

function getCouponHref(coupon: FeaturedCoupon) {
  return coupon.slug ? `/coupons/${coupon.slug}` : "/coupons";
}

export default async function FeaturedCoupons() {
  const today = new Date().toISOString();

  /* =========================================================
     GET FEATURED COUPONS
  ========================================================= */

  const { data: couponRows, error } = await supabase
    .from("coupons")
    .select(
      `
        *,
        stores!coupons_store_id_fkey (
          id,
          name,
          slug,
          logo_url
        )
      `,
    )
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
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
    .limit(10);

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  if (error) {
    console.error("Error fetching featured coupons:", error);
  }

  const coupons = (couponRows || []) as FeaturedCoupon[];

  if (coupons.length === 0) {
    return null;
  }

  /* =========================================================
     FEATURED / SECONDARY
  ========================================================= */

  const lead = coupons[0];

  const secondary = coupons.slice(1, 5);

  const leadDiscount = getDiscount(lead.discount_value);

  const leadSalePrice = formatPrice(lead.sale_price);

  const leadOriginalPrice = formatPrice(lead.original_price);

  const leadStore = lead.stores?.name || lead.store_name || "Store";

  const leadStoreLogo = lead.stores?.logo_url || null;

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-[30px]
        border
        border-slate-200/70
        bg-[radial-gradient(circle_at_10%_10%,rgba(167,243,208,0.45),transparent_26%),radial-gradient(circle_at_92%_14%,rgba(186,230,253,0.34),transparent_24%),linear-gradient(180deg,#f8fffc_0%,#ffffff_42%,#f7fcff_100%)]
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-7
        lg:py-7
      "
    >
      {/* =====================================================
          SOFT BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-24
          top-20
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
          <div className="flex items-center gap-2.5">
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-100
                bg-white/80
                text-sm
                shadow-sm
                backdrop-blur
                sm:h-9
                sm:w-9
              "
            >
              ⭐
            </span>

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
                  truncate
                  text-xl
                  font-black
                  tracking-tight
                  text-slate-950
                  sm:text-2xl
                "
              >
                Deals worth a closer look
              </h2>
            </div>
          </div>

          <p
            className="
              mt-1.5
              max-w-xl
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
            "
          >
            Hand-picked offers from our active coupon list.
          </p>
        </div>

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
            LEAD FEATURED DEAL
        =================================================== */}

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

            {lead.verified === true ? (
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
              h-[210px]
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

            {leadDiscount > 0 ? (
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
                {leadDiscount}% OFF
              </span>
            ) : null}
          </div>

          {/* CONTENT */}

          <div className="relative z-10 px-5 pt-4">
            <div className="flex items-center gap-2">
              {leadStoreLogo ? (
                <img
                  src={leadStoreLogo}
                  alt={leadStore}
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
                  {leadStore.trim().charAt(0).toUpperCase()}
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
                {leadStore}
              </span>
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

            {/* PRICE */}

            <div className="mt-3 flex items-end gap-2">
              {leadSalePrice ? (
                <span
                  className="
                    text-2xl
                    font-black
                    leading-none
                    tracking-tight
                    text-slate-950
                  "
                >
                  {leadSalePrice}
                </span>
              ) : null}

              {leadOriginalPrice ? (
                <span
                  className="
                    pb-0.5
                    text-[10px]
                    font-medium
                    text-slate-400
                    line-through
                  "
                >
                  {leadOriginalPrice}
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

        {/* ===================================================
            FOUR FEATURED CARDS
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
          MOBILE / TABLET
      ===================================================== */}

      <div className="relative z-10 mt-5 lg:hidden">
        {/* LEAD */}

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

            {lead.verified === true ? (
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
              <div className="flex items-center gap-1.5">
                {leadStoreLogo ? (
                  <img
                    src={leadStoreLogo}
                    alt={leadStore}
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
                    {leadStore.trim().charAt(0).toUpperCase()}
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
                  {leadStore}
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

              {leadDiscount > 0 ? (
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
                  {leadDiscount}% OFF
                </div>
              ) : null}

              {leadSalePrice ? (
                <div
                  className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-950
                  "
                >
                  {leadSalePrice}
                </div>
              ) : null}
            </div>

            <div
              className="
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

        {/* ===================================================
            MOBILE DEAL LIST
        =================================================== */}

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

        {/* MOBILE VIEW ALL */}

        <Link
          href="/deals"
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
          View all deals
          <span className="text-sm">→</span>
        </Link>
      </div>
    </section>
  );
}
