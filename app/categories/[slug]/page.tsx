import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const CATEGORY_NAMES: Record<string, string> = {
  electronics: "Electronics",
  home: "Home",
  fashion: "Fashion",
  beauty: "Beauty",
  kitchen: "Kitchen",
  health: "Health",
  sports: "Sports",
  baby: "Baby",
};

function normalizeCategory(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const categoryName =
    CATEGORY_NAMES[slug.toLowerCase()] ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .or("status.eq.active,status.is.null")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Category page error:", error);
  }

  const coupons = (data ?? []).filter((coupon) => {
    const couponCategory = coupon.category;

    if (!couponCategory) {
      return false;
    }

    return normalizeCategory(String(couponCategory)) === slug.toLowerCase();
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="transition hover:text-emerald-600">
              Home
            </Link>

            <span className="text-slate-300">/</span>

            <Link
              href="/categories"
              className="transition hover:text-emerald-600"
            >
              Categories
            </Link>

            <span className="text-slate-300">/</span>

            <span className="text-slate-900">{categoryName}</span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Category
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              {categoryName} deals
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Browse the latest coupons and offers in {categoryName}.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <section className="py-10 sm:py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {coupons.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Latest {categoryName} deals
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {coupons.length} deals available
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
                  All coupons
                </Link>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {coupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            </>
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
                No deals found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                There are no active deals in this category yet.
              </p>

              <Link
                href="/coupons"
                className="
                  mt-6
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
                Browse all coupons
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
