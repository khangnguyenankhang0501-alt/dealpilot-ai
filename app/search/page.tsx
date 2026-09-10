import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const query = typeof params?.q === "string" ? params.q.trim() : "";

  if (!query) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mb-6 text-xs font-semibold text-slate-400">
            <Link href="/" className="transition-colors hover:text-slate-700">
              Home
            </Link>

            <span className="mx-2">/</span>

            <span className="text-slate-500">Search</span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔍
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              Search DealPilot
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Search for coupons, products, coupon codes, or stores using the
              search bar above.
            </p>

            <Link
              href="/coupons"
              className="
                mx-auto mt-6 flex h-11 w-fit
                items-center justify-center
                rounded-xl bg-emerald-500
                px-5 text-xs font-black
                uppercase tracking-wide text-white
                transition-colors
                hover:bg-emerald-600
              "
            >
              Browse coupons
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Escape characters that have special meaning
   * inside a PostgREST .or() filter.
   */
  const safeQuery = query
    .replace(/\\/g, "")
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const now = new Date().toISOString();

  /*
   * Search in:
   *
   * - title
   * - store_name
   * - slug
   * - coupon_code
   *
   * ilike makes the search case-insensitive.
   */
  const { data: couponRows, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("status", "Active")
    .or(
      `title.ilike.%${safeQuery}%,store_name.ilike.%${safeQuery}%,slug.ilike.%${safeQuery}%,coupon_code.ilike.%${safeQuery}%`,
    )
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  /*
   * Load stores separately so CouponCard
   * can continue displaying store logos.
   */
  const { data: storeRows } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url");

  const storesByName = new Map<string, StoreRow>();

  for (const store of (storeRows || []) as StoreRow[]) {
    if (!store.name) {
      continue;
    }

    storesByName.set(store.name.trim().toLowerCase(), store);
  }

  /*
   * Attach matching store information
   * to each coupon.
   */
  const coupons = (couponRows || []).map((coupon: any) => {
    const storeKey =
      typeof coupon.store_name === "string"
        ? coupon.store_name.trim().toLowerCase()
        : "";

    const store = storeKey ? storesByName.get(storeKey) : null;

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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* ===================================================== */}
        {/* BREADCRUMB                                           */}
        {/* ===================================================== */}

        <div className="mb-5 text-xs font-semibold text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-700">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-slate-500">Search</span>
        </div>

        {/* ===================================================== */}
        {/* SEARCH TITLE                                         */}
        {/* ===================================================== */}

        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">
            Search results
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Results for "{query}"
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {error
              ? "We couldn't load the search results."
              : coupons.length > 0
                ? `${coupons.length} ${
                    coupons.length === 1 ? "deal" : "deals"
                  } found`
                : "No matching deals found"}
          </p>
        </div>

        {/* ===================================================== */}
        {/* ERROR                                                */}
        {/* ===================================================== */}

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4">
            <p className="text-sm font-bold text-rose-600">Search failed.</p>

            <p className="mt-1 text-xs font-medium text-rose-400">
              Please try the search again.
            </p>
          </div>
        ) : null}

        {/* ===================================================== */}
        {/* NO RESULTS                                           */}
        {/* ===================================================== */}

        {!error && coupons.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔍
            </div>

            <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">
              No deals found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any active coupons matching "{query}".
            </p>

            <Link
              href="/coupons"
              className="
                mx-auto mt-6 flex h-11 w-fit
                items-center justify-center
                rounded-xl bg-emerald-500
                px-5 text-xs font-black
                uppercase tracking-wide text-white
                transition-colors
                hover:bg-emerald-600
              "
            >
              Browse all coupons
            </Link>
          </div>
        ) : null}

        {/* ===================================================== */}
        {/* RESULTS                                              */}
        {/* ===================================================== */}

        {!error && coupons.length > 0 ? (
          <section>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {coupons.map((coupon: any) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
