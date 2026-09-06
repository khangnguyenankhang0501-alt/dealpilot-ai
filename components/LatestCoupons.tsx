import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function LatestCoupons() {
  const today = new Date().toISOString();

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

  if (error) {
    console.error("Error fetching latest coupons:", error);
  }

  const hasCoupons = Boolean(coupons && coupons.length > 0);

  return (
    <section className="w-full">
      {/* =========================================================
          HEADER
      ========================================================= */}

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
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-100
                bg-cyan-50
                text-base
                shadow-sm
                sm:h-10
                sm:w-10
                sm:text-lg
              "
            >
              🆕
            </div>

            <div className="min-w-0">
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

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-slate-500
                  sm:text-xs
                "
              >
                Fresh coupon codes and deals added most recently.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2.5
            sm:flex
          "
        >
          {hasCoupons && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-100
                bg-cyan-50/70
                px-3
                py-1.5
              "
            >
              <span
                className="
                  relative
                  flex
                  h-2
                  w-2
                "
              >
                <span
                  className="
                    absolute
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-cyan-400
                    opacity-50
                  "
                />

                <span
                  className="
                    relative
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-500
                  "
                />
              </span>

              <span
                className="
                  text-[11px]
                  font-bold
                  text-cyan-700
                "
              >
                Latest today
              </span>
            </div>
          )}

          <Link
            href="/coupons"
            className="
              inline-flex
              h-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3.5
              text-[11px]
              font-extrabold
              text-slate-700
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-600
            "
          >
            View all coupons
            <span className="ml-1">→</span>
          </Link>
        </div>
      </div>

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}

      {!hasCoupons ? (
        <div
          className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-6
            py-12
            text-center
            shadow-[0_6px_20px_rgba(15,23,42,0.04)]
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-slate-50
              text-2xl
            "
          >
            🏷️
          </div>

          <h3
            className="
              mt-4
              text-sm
              font-black
              text-slate-900
            "
          >
            No active coupons right now
          </h3>

          <p
            className="
              mt-1.5
              max-w-sm
              text-xs
              leading-5
              text-slate-500
            "
          >
            New deals and coupon codes will appear here as they are added.
          </p>

          <Link
            href="/deals"
            className="
              mt-5
              inline-flex
              h-9
              items-center
              rounded-xl
              bg-emerald-500
              px-4
              text-xs
              font-extrabold
              text-white
              shadow-sm
              transition
              hover:bg-emerald-600
            "
          >
            Explore deals
            <span className="ml-1.5">→</span>
          </Link>
        </div>
      ) : (
        <>
          {/* =======================================================
              COUPON GRID
          ======================================================= */}

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
              lg:gap-6
            "
          >
            {coupons!.map((coupon) => (
              <div
                key={coupon.id}
                className="
                  flex
                  min-w-0
                  w-full
                "
              >
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>

          {/* =======================================================
              MOBILE VIEW ALL
          ======================================================= */}

          <div
            className="
              mt-5
              flex
              justify-center
              sm:hidden
            "
          >
            <Link
              href="/coupons"
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-xs
                font-extrabold
                text-slate-700
                shadow-sm
                transition-all
                duration-200
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-600
              "
            >
              View all coupons
              <span className="ml-1.5">→</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
