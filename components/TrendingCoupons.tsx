import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function TrendingCoupons() {
  const now = new Date();
  const today = now.toISOString();

  /* =========================================================
     TRENDING WINDOW
     Ưu tiên các deal mới trong 7 ngày gần nhất
  ========================================================= */

  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  /* =========================================================
     GET TRENDING COUPONS

     Ưu tiên:
     1. Coupon mới trong 7 ngày
     2. popularity_count
     3. click_count
     4. created_at mới nhất
  ========================================================= */

  const { data: recentCoupons, error: recentError } = await supabase
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
    .gte("created_at", sevenDaysAgo)
    .order("popularity_count", {
      ascending: false,
      nullsFirst: false,
    })
    .order("click_count", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(10);

  if (recentError) {
    console.error("Error fetching recent trending coupons:", recentError);
  }

  /*
   * Nếu chưa có đủ 10 deal trong 7 ngày gần nhất,
   * lấy thêm các deal active còn lại để tránh section bị ít card.
   */

  let coupons = recentCoupons ?? [];

  if (!recentError && coupons.length < 10) {
    const existingIds = new Set(coupons.map((coupon) => coupon.id));

    const { data: fallbackCoupons, error: fallbackError } = await supabase
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
      .order("popularity_count", {
        ascending: false,
        nullsFirst: false,
      })
      .order("click_count", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(20);

    if (fallbackError) {
      console.error("Error fetching trending fallback coupons:", fallbackError);
    } else {
      const fallbackUnique = (fallbackCoupons ?? []).filter(
        (coupon) => !existingIds.has(coupon.id),
      );

      coupons = [...coupons, ...fallbackUnique].slice(0, 10);
    }
  }

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (coupons.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          mb-5
          flex
          items-end
          justify-between
          gap-4
          sm:mb-6
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
                bg-emerald-50
                text-sm
                shadow-sm
                sm:h-9
                sm:w-9
                sm:text-base
              "
            >
              🔥
            </span>

            <h2
              className="
                truncate
                text-xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-2xl
              "
            >
              Trending Coupons
            </h2>
          </div>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
            "
          >
            Fresh deals getting attention right now
          </p>
        </div>

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            px-3
            py-1.5
            shadow-sm
            sm:flex
          "
        >
          <span
            className="
              h-2
              w-2
              animate-pulse
              rounded-full
              bg-emerald-500
            "
          />

          <span
            className="
              text-[11px]
              font-bold
              text-slate-500
            "
          >
            Trending now
          </span>
        </div>
      </div>

      {/* =====================================================
          COUPON SCROLLER
      ===================================================== */}

      <div
        className="
          flex
          w-full
          gap-3
          overflow-x-auto
          overflow-y-hidden
          pb-3
          pt-1
          snap-x
          snap-mandatory
          scroll-smooth
          overscroll-x-contain
          touch-pan-x
          [-webkit-overflow-scrolling:touch]

          [scrollbar-width:thin]
          [&::-webkit-scrollbar]:h-1.5
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-slate-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-300
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-400

          sm:gap-4
        "
      >
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="
              w-[285px]
              min-w-[285px]
              max-w-[285px]
              shrink-0
              snap-start
              self-stretch

              sm:w-[270px]
              sm:min-w-[270px]
              sm:max-w-[270px]

              lg:w-[calc((100%-64px)/5)]
              lg:min-w-[calc((100%-64px)/5)]
              lg:max-w-[calc((100%-64px)/5)]
            "
          >
            <CouponCard coupon={coupon} />
          </div>
        ))}
      </div>

      {/* =====================================================
          MOBILE HINT
      ===================================================== */}

      {coupons.length > 5 && (
        <div
          className="
            mt-1
            flex
            items-center
            justify-center
            gap-1.5
            text-[10px]
            font-semibold
            text-slate-400
            sm:hidden
          "
        >
          <span>Swipe to explore</span>

          <span className="text-slate-500">→</span>
        </div>
      )}
    </section>
  );
}
