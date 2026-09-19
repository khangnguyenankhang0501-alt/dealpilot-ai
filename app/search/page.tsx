import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-10 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              DealPilot
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Search coupons & deals
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Search for a store, coupon, promo code, or deal using the search
              box above.
            </p>

            <Link
              href="/coupons"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse all coupons
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const safeQuery = query.replace(/[%_,()]/g, "").trim();

  if (!safeQuery) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-10 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              DealPilot
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Search coupons & deals
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Enter a store or deal name to start searching.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
        id,
        title,
        slug,
        coupon_code,
        affiliate_url,
        image_url,
        discount_value,
        original_price,
        sale_price,
        status,
        expires_at,
        verified,
        rating,
        review_count,
        popularity_count,
        click_count,
        store_name,
        store_id,
        shipping_text,
        sold_text,
        badge,
        is_exclusive,
        created_at,
        stores!coupons_store_id_fkey (
          id,
          name,
          slug,
          logo_url
        )
      `,
    )
    .or(`title.ilike.%${safeQuery}%,store_name.ilike.%${safeQuery}%`)
    .or(`status.eq.active,status.is.null`)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("created_at", {
      ascending: false,
    })
    .limit(24);

  const coupons = data ?? [];

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Search results
          </p>

          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Results for &quot;{query}&quot;
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {coupons.length > 0
              ? `${coupons.length} active ${
                  coupons.length === 1 ? "deal" : "deals"
                } found.`
              : "No active deals found for this search."}
          </p>
        </div>

        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-10 sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ?
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No matching deals
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Try a different store name, coupon title, or a broader search.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/coupons"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Browse coupons
              </Link>

              <Link
                href="/deals"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Browse deals
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
