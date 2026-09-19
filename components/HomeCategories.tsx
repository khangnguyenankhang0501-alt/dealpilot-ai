import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
  },
  {
    name: "Home",
    slug: "home",
    icon: "🏠",
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
  },
  {
    name: "Beauty",
    slug: "beauty",
    icon: "✨",
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    icon: "🍳",
  },
  {
    name: "Health",
    slug: "health",
    icon: "💚",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "⚽",
  },
  {
    name: "Baby",
    slug: "baby",
    icon: "🍼",
  },
];

export default function HomeCategories() {
  return (
    <section className="bg-slate-50 py-10 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Explore
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Shop by category
            </h2>

            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Find deals across popular shopping categories.
            </p>
          </div>

          <Link
            href="/coupons"
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
            Browse all
          </Link>
        </div>

        {/* =========================================================
            CATEGORY GRID
        ========================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="
                group
                flex
                min-h-[108px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-3
                py-4
                text-center
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-emerald-200
                hover:bg-emerald-50/60
                hover:shadow-md
              "
            >
              <span
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-xl
                  transition
                  group-hover:bg-emerald-100
                  group-hover:scale-105
                "
              >
                {category.icon}
              </span>

              <span
                className="
                  mt-3
                  text-xs
                  font-black
                  text-slate-800
                  transition
                  group-hover:text-emerald-700
                "
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* =========================================================
            MOBILE VIEW ALL
        ========================================================= */}

        <div className="mt-4 sm:hidden">
          <Link
            href="/coupons"
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
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
            Browse all coupons
          </Link>
        </div>
      </div>
    </section>
  );
}
