import Link from "next/link";

type SortOption = "relevant" | "discount" | "price_low" | "newest";

type StoreOption = {
  id: string;
  name: string;
  slug: string;
};

type CategoryOption = {
  label: string;
  value: string;
};

interface MobileSearchFiltersProps {
  query: string;
  storeFilter: string;
  categoryFilter: string;
  sort: SortOption;
  stores: StoreOption[];
  categories: CategoryOption[];
}

function buildSearchUrl(
  query: string,
  page: number,
  sort: SortOption,
  store = "",
  category = "",
) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (sort !== "relevant") {
    params.set("sort", sort);
  }

  if (store) {
    params.set("store", store);
  }

  if (category) {
    params.set("category", category);
  }

  const queryString = params.toString();

  return queryString ? `/search?${queryString}` : "/search";
}

export default function MobileSearchFilters({
  query,
  storeFilter,
  categoryFilter,
  sort,
  stores,
  categories,
}: MobileSearchFiltersProps) {
  const activeFilterCount =
    Number(Boolean(storeFilter)) +
    Number(Boolean(categoryFilter)) +
    Number(sort !== "relevant");

  return (
    <div className="lg:hidden">
      <details
        open={activeFilterCount > 0}
        className="
          overflow-hidden
          rounded-[20px]
          border
          border-slate-200
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        "
      >
        <summary
          className="
            flex
            min-h-[52px]
            cursor-pointer
            list-none
            items-center
            justify-between
            gap-3
            px-4
            py-3
            text-sm
            font-black
            text-slate-900
          "
        >
          <span className="flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-sm
              "
            >
              ⚙
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

          <span
            className="
              text-xs
              font-bold
              text-slate-400
            "
          >
            ▼
          </span>
        </summary>

        <div
          className="
            border-t
            border-slate-100
            px-4
            pb-4
            pt-4
          "
        >
          {/* ===================================================
              ACTIVE FILTERS
          =================================================== */}

          {activeFilterCount > 0 ? (
            <div
              className="
                mb-4
                flex
                flex-wrap
                gap-2
              "
            >
              {storeFilter ? (
                <Link
                  href={buildSearchUrl(query, 1, sort, "", categoryFilter)}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-bold
                    text-emerald-700
                  "
                >
                  Store
                  <span className="font-black">×</span>
                </Link>
              ) : null}

              {categoryFilter ? (
                <Link
                  href={buildSearchUrl(query, 1, sort, storeFilter, "")}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-sky-200
                    bg-sky-50
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-bold
                    text-sky-700
                  "
                >
                  Category
                  <span className="font-black">×</span>
                </Link>
              ) : null}

              {sort !== "relevant" ? (
                <Link
                  href={buildSearchUrl(
                    query,
                    1,
                    "relevant",
                    storeFilter,
                    categoryFilter,
                  )}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >
                  Sort
                  <span className="font-black">×</span>
                </Link>
              ) : null}

              <Link
                href={buildSearchUrl(query, 1, "relevant", "", "")}
                className="
                  inline-flex
                  items-center
                  rounded-full
                  px-2
                  py-1.5
                  text-[10px]
                  font-black
                  text-emerald-600
                "
              >
                Clear all
              </Link>
            </div>
          ) : null}

          {/* ===================================================
              STORE
          =================================================== */}

          <div>
            <div
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              Store
            </div>

            <div
              className="
                mt-2
                grid
                grid-cols-2
                gap-2
              "
            >
              <Link
                href={buildSearchUrl(query, 1, sort, "", categoryFilter)}
                className={`
                  flex
                  min-h-[42px]
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  text-xs
                  font-semibold
                  ${
                    !storeFilter
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }
                `}
              >
                <span className="truncate">All stores</span>

                {!storeFilter ? (
                  <span className="ml-2 font-black">✓</span>
                ) : null}
              </Link>

              {stores.map((store) => {
                const selected =
                  storeFilter === store.slug || storeFilter === store.name;

                return (
                  <Link
                    key={store.id}
                    href={buildSearchUrl(
                      query,
                      1,
                      sort,
                      store.slug,
                      categoryFilter,
                    )}
                    className={`
                        flex
                        min-h-[42px]
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        ${
                          selected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }
                      `}
                  >
                    <span className="truncate">{store.name}</span>

                    {selected ? (
                      <span className="ml-2 font-black">✓</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              CATEGORY
          =================================================== */}

          <div
            className="
              mt-5
              border-t
              border-slate-100
              pt-5
            "
          >
            <div
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              Category
            </div>

            <div
              className="
                mt-2
                grid
                grid-cols-2
                gap-2
              "
            >
              <Link
                href={buildSearchUrl(query, 1, sort, storeFilter, "")}
                className={`
                  flex
                  min-h-[42px]
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  text-xs
                  font-semibold
                  ${
                    !categoryFilter
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }
                `}
              >
                <span className="truncate">All categories</span>

                {!categoryFilter ? (
                  <span className="ml-2 font-black">✓</span>
                ) : null}
              </Link>

              {categories.map((category) => {
                const selected =
                  categoryFilter.toLowerCase() === category.value.toLowerCase();

                return (
                  <Link
                    key={category.value}
                    href={buildSearchUrl(
                      query,
                      1,
                      sort,
                      storeFilter,
                      category.value,
                    )}
                    className={`
                        flex
                        min-h-[42px]
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        ${
                          selected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }
                      `}
                  >
                    <span className="truncate">{category.label}</span>

                    {selected ? (
                      <span className="ml-2 font-black">✓</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              SORT
          =================================================== */}

          <div
            className="
              mt-5
              border-t
              border-slate-100
              pt-5
            "
          >
            <div
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              Sort by
            </div>

            <div
              className="
                mt-2
                grid
                grid-cols-2
                gap-2
              "
            >
              {[
                {
                  value: "relevant" as const,
                  label: "Most relevant",
                },
                {
                  value: "discount" as const,
                  label: "Highest discount",
                },
                {
                  value: "price_low" as const,
                  label: "Lowest price",
                },
                {
                  value: "newest" as const,
                  label: "Newest",
                },
              ].map((sortOption) => {
                const selected = sort === sortOption.value;

                return (
                  <Link
                    key={sortOption.value}
                    href={buildSearchUrl(
                      query,
                      1,
                      sortOption.value,
                      storeFilter,
                      categoryFilter,
                    )}
                    className={`
                        flex
                        min-h-[42px]
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        ${
                          selected
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }
                      `}
                  >
                    <span>{sortOption.label}</span>

                    {selected ? (
                      <span className="ml-2 font-black">✓</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
