import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export default async function HomeLatest() {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("coupons")
    .select("*")
    .or("status.eq.active,status.is.null")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(8);

  const coupons = data ?? [];

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Fresh deals
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Latest deals
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Fresh coupons and offers recently added to DealPilot.
            </p>
          </div>

          <Link
            href="/coupons"
            className="
              shrink-0
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-700
              shadow-sm
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            View all
          </Link>
        </div>

        {/* =========================================================
            EMPTY STATE
        ========================================================= */}

        {coupons.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-slate-50
              px-6
              py-14
              text-center
            "
          >
            <div className="text-sm font-bold text-slate-700">
              No latest deals available right now.
            </div>

            <div className="mt-1 text-xs font-medium text-slate-500">
              Check back soon for new offers.
            </div>
          </div>
        ) : (
          <>
            {/* =======================================================
                DESKTOP
            ======================================================= */}

            <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
              {coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>

            {/* =======================================================
                MOBILE
            ======================================================= */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:gap-4
                md:hidden
              "
            >
              {coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
