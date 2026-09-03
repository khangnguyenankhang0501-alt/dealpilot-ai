import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function LatestCoupons() {
  /* =========================================================
     CURRENT TIME
  ========================================================= */

  const today = new Date().toISOString();

  /* =========================================================
     FETCH LATEST COUPONS
  ========================================================= */

  const { data: coupons, error } = await supabase
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
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(12);

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  if (error) {
    console.error("Error fetching latest coupons:", error);
  }

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!coupons || coupons.length === 0) {
    return (
      <section className="w-full">
        {/* HEADER */}

        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-cyan-50
                text-base
                shadow-sm
                sm:h-9
                sm:w-9
                sm:text-lg
              "
            >
              🆕
            </span>

            <h2
              className="
                text-xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-2xl
              "
            >
              Latest Coupons
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
            Fresh coupon codes and deals added recently.
          </p>
        </div>

        {/* EMPTY STATE */}

        <div
          className="
            flex
            min-h-[180px]
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-12
            text-center
            text-sm
            font-medium
            text-slate-500
            shadow-sm
          "
        >
          No active coupons available right now.
        </div>
      </section>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

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
        {/* LEFT */}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-cyan-50
                text-base
                shadow-sm
                sm:h-9
                sm:w-9
                sm:text-lg
              "
            >
              🆕
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
              Latest Coupons
            </h2>
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
            Fresh coupon codes and deals added recently.
          </p>
        </div>

        {/* RIGHT STATUS */}

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
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="
                absolute
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-60
              "
            />

            <span
              className="
                relative
                h-2.5
                w-2.5
                rounded-full
                bg-emerald-500
              "
            />
          </span>

          <span className="text-[11px] font-bold text-slate-500">
            Updated today
          </span>
        </div>
      </div>

      {/* =====================================================
          COUPON GRID
      ===================================================== */}

      <div
        className="
          grid
          w-full
          grid-cols-1
          items-stretch
          gap-4
          sm:grid-cols-2
          sm:gap-5
          lg:grid-cols-3
        "
      >
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="
              flex
              min-w-0
              w-full
              max-w-full
            "
          >
            <CouponCard coupon={coupon} />
          </div>
        ))}
      </div>
    </section>
  );
}
