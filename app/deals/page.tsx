import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

export default async function DealsPage() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .or("status.eq.active,status.is.null")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("discount_value", { ascending: false })
    .order("click_count", { ascending: false })
    .order("popularity_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("Deals page error:", error);
  }

  const deals = data ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* BREADCRUMB */}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="transition hover:text-emerald-600">
              Home
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-bold text-slate-900">Deals</span>
          </div>

          {/* TITLE */}

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                DealPilot
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Deals worth checking
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Browse active offers, discounts and coupon deals currently
              available on DealPilot.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK NAVIGATION
      ========================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/deals"
            className="
              rounded-xl
              bg-emerald-50
              px-4
              py-2.5
              text-xs
              font-black
              text-emerald-700
            "
          >
            All deals
          </Link>

          <Link
            href="/coupons"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-700
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            Coupons
          </Link>

          <Link
            href="/categories"
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-700
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
          >
            Categories
          </Link>
        </div>
      </section>

      {/* =========================================================
          DEALS
      ========================================================= */}

      <section className="py-8 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                Active deals
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {deals.length} deals currently available
              </p>
            </div>

            <Link
              href="/categories"
              className="
                hidden
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
                sm:inline-flex
              "
            >
              Explore categories
            </Link>
          </div>

          {deals.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {deals.map((deal) => (
                <CouponCard key={deal.id} coupon={deal} />
              ))}
            </div>
          ) : (
            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                px-6
                py-16
                text-center
                shadow-sm
              "
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🏷️
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                No active deals right now
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                Check the coupon section or explore categories for more offers.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/coupons"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-600
                  "
                >
                  Browse coupons
                </Link>

                <Link
                  href="/categories"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-slate-700
                    shadow-sm
                    transition
                    hover:border-emerald-200
                    hover:bg-emerald-50
                    hover:text-emerald-700
                  "
                >
                  Explore categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
