import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
    description: "Phones, computers, gadgets and accessories.",
  },
  {
    name: "Home",
    slug: "home",
    icon: "🏠",
    description: "Furniture, decor, storage and everyday home deals.",
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
    description: "Clothing, shoes, bags and fashion accessories.",
  },
  {
    name: "Beauty",
    slug: "beauty",
    icon: "✨",
    description: "Beauty, skincare, haircare and personal care.",
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    icon: "🍳",
    description: "Cookware, appliances and useful kitchen essentials.",
  },
  {
    name: "Health",
    slug: "health",
    icon: "💚",
    description: "Health, wellness and everyday personal products.",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "⚽",
    description: "Fitness gear, sportswear and outdoor essentials.",
  },
  {
    name: "Baby",
    slug: "baby",
    icon: "🍼",
    description: "Baby products, clothing, toys and family essentials.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="transition hover:text-emerald-600">
              Home
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-bold text-slate-900">Categories</span>
          </div>

          <div className="mt-6 max-w-3xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                Explore deals
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
              Shop by category
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Explore coupons and deals by shopping category. Choose a category
              to see the latest available offers.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="
                  group
                  flex
                  min-h-[210px]
                  flex-col
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-100
                    text-2xl
                    transition
                    group-hover:bg-emerald-100
                    group-hover:scale-105
                  "
                >
                  {category.icon}
                </div>

                <h2 className="mt-5 text-xl font-black tracking-[-0.02em] text-slate-950 transition group-hover:text-emerald-700">
                  {category.name}
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  {category.description}
                </p>

                <div className="mt-auto pt-5 text-xs font-black text-emerald-600">
                  Explore {category.name} deals →
                </div>
              </Link>
            ))}
          </div>

          {/* =======================================================
              BOTTOM CTA
          ======================================================= */}

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Looking for something specific?
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Browse all available coupons and search for a store or
                  product.
                </p>
              </div>

              <Link
                href="/coupons"
                className="
                  inline-flex
                  shrink-0
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
          </div>
        </div>
      </section>
    </main>
  );
}
