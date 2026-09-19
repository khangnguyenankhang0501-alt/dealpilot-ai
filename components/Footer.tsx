import Link from "next/link";

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Home", slug: "home" },
  { name: "Fashion", slug: "fashion" },
  { name: "Beauty", slug: "beauty" },
];

const popularLinks = [
  { name: "All Coupons", href: "/coupons" },
  { name: "Categories", href: "/categories" },
  { name: "Saved Deals", href: "/saved" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            MAIN FOOTER
        ========================================================= */}

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
          {/* =======================================================
              BRAND
          ======================================================= */}

          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="DealPilot Home"
            >
              <span className="text-2xl font-black tracking-[-0.05em] text-slate-950">
                Deal
                <span className="text-emerald-500">Pilot</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-slate-500">
              Discover coupons, discounts and fresh deals from stores you shop
              every day.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Fresh deals updated regularly
            </div>
          </div>

          {/* =======================================================
              CATEGORIES
          ======================================================= */}

          <div>
            <h3 className="text-sm font-black text-slate-950">Categories</h3>

            <div className="mt-4 space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-500
                    transition
                    hover:text-emerald-600
                  "
                >
                  {category.name}
                </Link>
              ))}

              <Link
                href="/categories"
                className="
                  block
                  pt-1
                  text-sm
                  font-black
                  text-emerald-600
                  transition
                  hover:text-emerald-700
                "
              >
                View all categories →
              </Link>
            </div>
          </div>

          {/* =======================================================
              QUICK LINKS
          ======================================================= */}

          <div>
            <h3 className="text-sm font-black text-slate-950">Explore</h3>

            <div className="mt-4 space-y-3">
              {popularLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-500
                    transition
                    hover:text-emerald-600
                  "
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* =======================================================
              ABOUT
          ======================================================= */}

          <div>
            <h3 className="text-sm font-black text-slate-950">DealPilot</h3>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
              Compare offers, discover savings and quickly find useful coupon
              codes and promotions.
            </p>

            <Link
              href="/coupons"
              className="
                mt-5
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-emerald-500
                px-4
                py-2.5
                text-xs
                font-black
                text-white
                shadow-sm
                transition
                hover:bg-emerald-600
              "
            >
              Browse deals
            </Link>
          </div>
        </div>

        {/* =========================================================
            BOTTOM BAR
        ========================================================= */}

        <div className="flex flex-col gap-3 border-t border-slate-100 py-6 text-xs font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DealPilot. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/coupons" className="transition hover:text-slate-600">
              Coupons
            </Link>

            <Link
              href="/categories"
              className="transition hover:text-slate-600"
            >
              Categories
            </Link>

            <Link href="/saved" className="transition hover:text-slate-600">
              Saved
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
