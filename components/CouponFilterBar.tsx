import Link from "next/link";

interface CouponFilterBarProps {
  query: string;
  store: string;
  category: string;
  sort: string;
  stores: Array<{
    name: string;
    slug: string;
  }>;
  categories: Array<{
    label: string;
    value: string;
  }>;
}

function buildHref({
  query,
  store,
  category,
  sort,
}: {
  query: string;
  store: string;
  category: string;
  sort: string;
}) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (store) {
    params.set("store", store);
  }

  if (category) {
    params.set("category", category);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  const queryString = params.toString();

  return queryString ? `/coupons?${queryString}` : "/coupons";
}

function getStoreName(slug: string, stores: CouponFilterBarProps["stores"]) {
  return stores.find((item) => item.slug === slug)?.name || slug;
}

function getCategoryLabel(
  value: string,
  categories: CouponFilterBarProps["categories"],
) {
  return categories.find((item) => item.value === value)?.label || value;
}

function getSortLabel(sort: string) {
  switch (sort) {
    case "popular":
      return "Most popular";

    case "discount":
      return "Highest discount";

    case "clicks":
      return "Most clicked";

    case "newest":
    default:
      return "Newest";
  }
}

export default function CouponFilterBar({
  query,
  store,
  category,
  sort,
  stores,
  categories,
}: CouponFilterBarProps) {
  const hasFilters =
    Boolean(query.trim()) ||
    Boolean(store) ||
    Boolean(category) ||
    (Boolean(sort) && sort !== "newest");

  const activeFilterCount = [
    Boolean(query.trim()),
    Boolean(store),
    Boolean(category),
    Boolean(sort && sort !== "newest"),
  ].filter(Boolean).length;

  const removeSearchHref = buildHref({
    query: "",
    store,
    category,
    sort,
  });

  const removeStoreHref = buildHref({
    query,
    store: "",
    category,
    sort,
  });

  const removeCategoryHref = buildHref({
    query,
    store,
    category: "",
    sort,
  });

  const removeSortHref = buildHref({
    query,
    store,
    category,
    sort: "newest",
  });

  return (
    <div
      className="
        rounded-[20px]
        border
        border-slate-200
        bg-white
        p-3
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
      "
    >
      {/* ================================================= */}
      {/* MOBILE                                           */}
      {/* ================================================= */}

      <form method="GET" action="/coupons" className="lg:hidden">
        {/* SEARCH */}

        <div className="relative min-w-0">
          <label htmlFor="coupon-search-mobile" className="sr-only">
            Search coupons or stores
          </label>

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-sm
              text-slate-400
            "
          >
            🔍
          </span>

          <input
            id="coupon-search-mobile"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search coupons or stores..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-4
              text-sm
              font-medium
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-emerald-400
              focus:bg-white
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        {/* FILTERS */}

        <details className="mt-2">
          <summary
            className="
              flex
              min-h-10
              cursor-pointer
              list-none
              select-none
              items-center
              justify-between
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              text-sm
              font-bold
              text-slate-700
              transition
              hover:border-slate-300
              hover:bg-white
              [&::-webkit-details-marker]:hidden
            "
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-xs text-slate-400">
                ☰
              </span>

              <span>Filters</span>

              {activeFilterCount > 0 ? (
                <span
                  className="
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-500
                    px-1.5
                    text-[9px]
                    font-black
                    text-white
                  "
                >
                  {activeFilterCount}
                </span>
              ) : null}
            </span>

            <span aria-hidden="true" className="text-[10px] text-slate-400">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3">
            {/* STORE */}

            <div className="min-w-0">
              <label htmlFor="coupon-store-mobile" className="sr-only">
                Store
              </label>

              <select
                id="coupon-store-mobile"
                name="store"
                defaultValue={store}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3.5
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  transition
                  focus:border-emerald-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              >
                <option value="">All stores</option>

                {stores.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div className="min-w-0">
              <label htmlFor="coupon-category-mobile" className="sr-only">
                Category
              </label>

              <select
                id="coupon-category-mobile"
                name="category"
                defaultValue={category}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3.5
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  transition
                  focus:border-emerald-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              >
                {categories.map((item) => (
                  <option key={item.value || "all"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT */}

            <div className="min-w-0">
              <label htmlFor="coupon-sort-mobile" className="sr-only">
                Sort coupons
              </label>

              <select
                id="coupon-sort-mobile"
                name="sort"
                defaultValue={sort || "newest"}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3.5
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                  transition
                  focus:border-emerald-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              >
                <option value="newest">Newest</option>

                <option value="popular">Most popular</option>

                <option value="discount">Highest discount</option>

                <option value="clicks">Most clicked</option>
              </select>
            </div>

            {/* ACTIONS */}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="
                  inline-flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500
                  px-5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-white
                  shadow-[0_8px_20px_rgba(16,185,129,0.16)]
                  transition
                  hover:bg-emerald-600
                "
              >
                Apply filters
              </button>

              {hasFilters ? (
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
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-slate-600
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </div>
        </details>
      </form>

      {/* ================================================= */}
      {/* DESKTOP                                          */}
      {/* ================================================= */}

      <form
        method="GET"
        action="/coupons"
        className="
          hidden
          items-center
          gap-3
          lg:grid
          lg:grid-cols-[minmax(240px,1.4fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_auto]
        "
      >
        {/* SEARCH */}

        <div className="relative min-w-0">
          <label htmlFor="coupon-search-desktop" className="sr-only">
            Search coupons or stores
          </label>

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-sm
              text-slate-400
            "
          >
            🔍
          </span>

          <input
            id="coupon-search-desktop"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search coupons or stores..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-4
              text-sm
              font-medium
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-emerald-400
              focus:bg-white
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        {/* STORE */}

        <div className="min-w-0">
          <label htmlFor="coupon-store-desktop" className="sr-only">
            Store
          </label>

          <select
            id="coupon-store-desktop"
            name="store"
            defaultValue={store}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              text-sm
              font-semibold
              text-slate-700
              outline-none
              transition
              focus:border-emerald-400
              focus:bg-white
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            <option value="">All stores</option>

            {stores.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}

        <div className="min-w-0">
          <label htmlFor="coupon-category-desktop" className="sr-only">
            Category
          </label>

          <select
            id="coupon-category-desktop"
            name="category"
            defaultValue={category}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              text-sm
              font-semibold
              text-slate-700
              outline-none
              transition
              focus:border-emerald-400
              focus:bg-white
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            {categories.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* SORT */}

        <div className="min-w-0">
          <label htmlFor="coupon-sort-desktop" className="sr-only">
            Sort coupons
          </label>

          <select
            id="coupon-sort-desktop"
            name="sort"
            defaultValue={sort || "newest"}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              text-sm
              font-semibold
              text-slate-700
              outline-none
              transition
              focus:border-emerald-400
              focus:bg-white
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            <option value="newest">Newest</option>

            <option value="popular">Most popular</option>

            <option value="discount">Highest discount</option>

            <option value="clicks">Most clicked</option>
          </select>
        </div>

        {/* ACTION */}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="
              inline-flex
              h-10
              min-w-[80px]
              items-center
              justify-center
              rounded-xl
              bg-emerald-500
              px-5
              text-[10px]
              font-black
              uppercase
              tracking-[0.08em]
              text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.16)]
              transition
              hover:bg-emerald-600
            "
          >
            Apply
          </button>
        </div>
      </form>

      {/* ================================================= */}
      {/* ACTIVE FILTERS                                  */}
      {/* ================================================= */}

      {hasFilters ? (
        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-2
            border-t
            border-slate-100
            pt-3
          "
        >
          <span
            className="
              mr-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-slate-400
            "
          >
            Active
            {activeFilterCount > 1 ? ` · ${activeFilterCount}` : ""}
          </span>

          {query.trim() ? (
            <Link
              href={removeSearchHref}
              className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-emerald-700
                transition
                hover:border-emerald-200
                hover:bg-emerald-100
              "
            >
              <span className="max-w-[180px] truncate">Search: {query}</span>

              <span aria-hidden="true" className="text-[12px] leading-none">
                ×
              </span>
            </Link>
          ) : null}

          {store ? (
            <Link
              href={removeStoreHref}
              className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-100
              "
            >
              <span className="max-w-[180px] truncate">
                Store: {getStoreName(store, stores)}
              </span>

              <span aria-hidden="true" className="text-[12px] leading-none">
                ×
              </span>
            </Link>
          ) : null}

          {category ? (
            <Link
              href={removeCategoryHref}
              className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-100
              "
            >
              <span className="max-w-[180px] truncate">
                Category: {getCategoryLabel(category, categories)}
              </span>

              <span aria-hidden="true" className="text-[12px] leading-none">
                ×
              </span>
            </Link>
          ) : null}

          {sort && sort !== "newest" ? (
            <Link
              href={removeSortHref}
              className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                text-slate-700
                transition
                hover:border-slate-300
                hover:bg-slate-100
              "
            >
              <span className="truncate">Sort: {getSortLabel(sort)}</span>

              <span aria-hidden="true" className="text-[12px] leading-none">
                ×
              </span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
