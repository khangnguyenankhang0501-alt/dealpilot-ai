import Link from "next/link";

const shopLinks = [
  { label: "Stores", href: "/stores" },
  { label: "Coupons", href: "/coupons" },
  { label: "Deals", href: "/deals" },
  { label: "Trending", href: "/trending" },
];

const exploreLinks = [
  { label: "Categories", href: "/categories" },
  { label: "Top Brands", href: "/top-brands" },
  { label: "Promo Codes", href: "/promo-codes" },
  { label: "Blog", href: "/blog" },
];

const helpLinks = [
  { label: "Saved Coupons", href: "/saved" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-white sm:mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div
          className="
            grid
            gap-10
            py-10
            sm:grid-cols-2
            sm:py-12
            lg:grid-cols-[1.5fr_1fr_1fr_1fr]
            lg:gap-12
            lg:py-14
          "
        >
          {/* ===================================================
              BRAND
          =================================================== */}

          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="DealPilot Home"
              className="inline-block text-2xl font-black tracking-tight"
            >
              Deal<span className="text-emerald-400">Pilot</span>
            </Link>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Find the latest verified coupon codes, promo codes, and online
              deals from your favorite stores.
            </p>

            {/* STATUS */}

            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-800
                bg-slate-900
                px-3
                py-1.5
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
                    opacity-50
                  "
                />

                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-semibold text-slate-400">
                Deals updated regularly
              </span>
            </div>
          </div>

          {/* ===================================================
              SHOP
          =================================================== */}

          <div>
            <h3 className="text-sm font-bold text-white">Shop</h3>

            <nav className="mt-4 space-y-3">
              {shopLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    block
                    text-sm
                    text-slate-400
                    transition-colors
                    duration-200
                    hover:text-emerald-400
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ===================================================
              EXPLORE
          =================================================== */}

          <div>
            <h3 className="text-sm font-bold text-white">Explore</h3>

            <nav className="mt-4 space-y-3">
              {exploreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    block
                    text-sm
                    text-slate-400
                    transition-colors
                    duration-200
                    hover:text-emerald-400
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ===================================================
              HELP
          =================================================== */}

          <div>
            <h3 className="text-sm font-bold text-white">Help</h3>

            <nav className="mt-4 space-y-3">
              {helpLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    block
                    text-sm
                    text-slate-400
                    transition-colors
                    duration-200
                    hover:text-emerald-400
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-800
            py-5
            text-xs
            text-slate-500
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>© {new Date().getFullYear()} DealPilot AI. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-300"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-slate-300"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-slate-300"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
