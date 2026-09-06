import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function LatestCoupons() {
  const today = new Date().toISOString();

  const { data: coupons } = await supabase
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
                Fresh coupon codes and deals added recently.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DESKTOP STATUS + VIEW ALL
        ===================================================== */}

        <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
          {hasCoupons && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                shadow-sm
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
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-600
            "
          >
            View all coupons →
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
            min-h-[200px]
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
            "
          >
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex min-w-0 w-full max-w-full">
                <CouponCard coupon={coupon} />
              </div>
            ))}
          </div>

          {/* =======================================================
              MOBILE VIEW ALL
          ======================================================= */}

          <div className="mt-5 flex justify-center sm:hidden">
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
              View all coupons →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
