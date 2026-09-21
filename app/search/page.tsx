import Link from "next/link";
import { redirect } from "next/navigation";
import CouponCard from "@/components/CouponCard";
import MobileSearchFilters from "@/components/MobileSearchFilters";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    store?: string;
    category?: string;
  }>;
}

const PAGE_SIZE = 48;

const ALLOWED_SORTS = ["relevant", "discount", "price_low", "newest"] as const;

type SortOption = (typeof ALLOWED_SORTS)[number];

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url?: string | null;
};

type Coupon = {
  id: string;
  title: string;
  slug: string;

  store_name: string | null;
  store_id?: string | null;

  category?: string | null;

  image_url: string | null;

  sale_price: number | string | null;

  original_price: number | string | null;

  discount_value: number | string | null;

  coupon_code: string | null;

  expires_at: string | null;
  verified: boolean | null;

  rating: number | string | null;

  review_count: number | string | null;

  popularity_count: number | string | null;

  click_count: number | string | null;

  shipping_text: string | null;
  sold_text: string | null;

  badge: string | null;
  is_exclusive: boolean | null;

  created_at: string | null;
};

const CATEGORY_OPTIONS = [
  {
    label: "Electronics",
    value: "Electronics",
  },
  {
    label: "Home",
    value: "Home",
  },
  {
    label: "Fashion",
    value: "Fashion",
  },
  {
    label: "Beauty",
    value: "Beauty",
  },
  {
    label: "Kitchen",
    value: "Kitchen",
  },
  {
    label: "Health",
    value: "Health",
  },
  {
    label: "Sports",
    value: "Sports",
  },
  {
    label: "Baby",
    value: "Baby",
  },
];

function normalizeSort(value?: string): SortOption {
  if (
    value === "relevant" ||
    value === "discount" ||
    value === "price_low" ||
    value === "newest"
  ) {
    return value;
  }

  return "relevant";
}

function normalizePage(value?: string) {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ");
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

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  const pages: Array<number | "ellipsis"> = [];

  pages.push(1);

  if (currentPage > 4) {
    pages.push("ellipsis");
  }

  const startPage = Math.max(2, currentPage - 1);

  const endPage = Math.min(totalPages - 1, currentPage + 1);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const {
    q,
    page: pageParam,
    sort: sortParam,
    store: storeParam,
    category: categoryParam,
  } = await searchParams;

  const query = q?.trim() || "";

  const currentPage = normalizePage(pageParam);

  const sort = normalizeSort(sortParam);

  const storeFilter = storeParam?.trim() || "";

  const categoryFilter = categoryParam?.trim() || "";

  /*
   * =========================================================
   * LOAD STORES
   * =========================================================
   */

  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url")
    .order("name", {
      ascending: true,
    })
    .limit(50);

  if (storeError) {
    throw new Error(storeError.message || "Failed to load stores.");
  }

  const stores = (storeData ?? []) as StoreRow[];

  /*
   * =========================================================
   * ACTIVE STORE
   * =========================================================
   */

  const activeStore = storeFilter
    ? stores.find(
        (store) => store.slug === storeFilter || store.name === storeFilter,
      )
    : null;

  /*
   * =========================================================
   * COUNT QUERY
   * =========================================================
   */

  let countQuery = supabase
    .from("coupons")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`);

  /*
   * SEARCH
   */

  if (query) {
    const safeQuery = sanitizeSearchTerm(query);

    if (safeQuery) {
      countQuery = countQuery.or(
        `title.ilike.%${safeQuery}%,store_name.ilike.%${safeQuery}%,coupon_code.ilike.%${safeQuery}%`,
      );
    }
  }

  /*
   * STORE
   */

  if (storeFilter) {
    if (activeStore?.id) {
      countQuery = countQuery.eq("store_id", activeStore.id);
    } else {
      countQuery = countQuery.eq("store_id", "__invalid_store__");
    }
  }

  /*
   * CATEGORY
   */

  if (categoryFilter) {
    countQuery = countQuery.ilike("category", categoryFilter);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(countError.message || "Failed to count search results.");
  }

  const totalCount = count ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /*
   * =========================================================
   * INVALID PAGE
   * =========================================================
   */

  if (totalCount > 0 && currentPage > totalPages) {
    redirect(
      buildSearchUrl(query, totalPages, sort, storeFilter, categoryFilter),
    );
  }

  /*
   * =========================================================
   * PAGINATION OFFSET
   * =========================================================
   */

  const from = (currentPage - 1) * PAGE_SIZE;

  /*
   * =========================================================
   * RPC SEARCH
   * =========================================================
   */

  const { data, error: searchError } = await supabase.rpc(
    "search_coupons_relevant",
    {
      p_query: query || null,

      p_store_id: storeFilter
        ? activeStore?.id
          ? String(activeStore.id)
          : "__invalid_store__"
        : null,

      p_category: categoryFilter || null,

      p_sort: sort,

      p_limit: PAGE_SIZE,

      p_offset: from,
    },
  );

  if (searchError) {
    throw new Error(searchError.message || "Failed to load search results.");
  }

  const coupons = (data ?? []) as Coupon[];

  /*
   * =========================================================
   * DISPLAY
   * =========================================================
   */

  const rangeStart = totalCount === 0 ? 0 : from + 1;

  const rangeEnd =
    totalCount === 0 ? 0 : Math.min(from + coupons.length, totalCount);

  const paginationPages = getPaginationPages(currentPage, totalPages);

  const selectedStoreName = activeStore?.name || storeFilter;

  /*
   * =========================================================
   * STORE OPTIONS
   * =========================================================
   */

  const storeFilterOptions = stores
    .filter((store) => Boolean(store.name) && Boolean(store.slug))
    .slice(0, 8)
    .map((store) => ({
      id: store.id,
      name: store.name as string,
      slug: store.slug as string,
    }));

  /*
   * =========================================================
   * MOBILE FILTER DATA
   * =========================================================
   */

  const mobileCategoryOptions = CATEGORY_OPTIONS;

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-10
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-emerald-600
              "
            >
              Search results
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-3xl
              "
            >
              {query ? `Results for "${query}"` : "Search deals"}
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              {query
                ? "Browse active coupons and deals related to your search."
                : "Browse active coupons and deals from DealPilot."}
            </p>
          </div>

          {totalCount > 0 ? (
            <div
              className="
                hidden
                shrink-0
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-wide
                text-slate-500
                shadow-sm
                sm:block
              "
            >
              {totalCount.toLocaleString()} deals
            </div>
          ) : null}
        </div>

        {/* =====================================================
            SELECTED FILTER PILLS
        ===================================================== */}

        {storeFilter || categoryFilter || sort !== "relevant" ? (
          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {storeFilter ? (
              <Link
                href={buildSearchUrl(query, 1, sort, "", categoryFilter)}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  text-emerald-700
                "
              >
                Store:
                <span className="font-black">{selectedStoreName}</span>
                <span className="text-emerald-500">×</span>
              </Link>
            ) : null}

            {categoryFilter ? (
              <Link
                href={buildSearchUrl(query, 1, sort, storeFilter, "")}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-sky-200
                  bg-sky-50
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  text-sky-700
                "
              >
                Category:
                <span className="font-black">{categoryFilter}</span>
                <span className="text-sky-500">×</span>
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
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  text-slate-600
                "
              >
                Sort:
                <span className="font-black">
                  {sort === "discount"
                    ? "Highest discount"
                    : sort === "price_low"
                      ? "Lowest price"
                      : "Newest"}
                </span>
                <span className="text-slate-400">×</span>
              </Link>
            ) : null}

            <Link
              href={buildSearchUrl(query, 1, "relevant", "", "")}
              className="
                ml-1
                text-[10px]
                font-black
                uppercase
                tracking-[0.08em]
                text-emerald-600
              "
            >
              Clear all
            </Link>
          </div>
        ) : null}

        {/* =====================================================
            MOBILE FILTERS
        ===================================================== */}

        <div className="mt-5">
          <MobileSearchFilters
            query={query}
            storeFilter={storeFilter}
            categoryFilter={categoryFilter}
            sort={sort}
            stores={storeFilterOptions}
            categories={mobileCategoryOptions}
          />
        </div>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <div
          className="
            mt-7
            grid
            gap-6
            lg:grid-cols-[220px_minmax(0,1fr)]
            lg:items-start
          "
        >
          {/* ===================================================
              DESKTOP SIDEBAR
          =================================================== */}

          <aside
            className="
              hidden
              rounded-[22px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              lg:block
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Refine
                </p>

                <h2
                  className="
                    mt-1
                    text-sm
                    font-black
                    text-slate-950
                  "
                >
                  Filters
                </h2>
              </div>

              {storeFilter || categoryFilter || sort !== "relevant" ? (
                <Link
                  href={buildSearchUrl(query, 1, "relevant", "", "")}
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-emerald-600
                  "
                >
                  Reset
                </Link>
              ) : null}
            </div>

            {/* STORE */}

            <div className="mt-6">
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

              <div className="mt-3 space-y-1.5">
                <Link
                  href={buildSearchUrl(query, 1, sort, "", categoryFilter)}
                  className={`
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    ${
                      !storeFilter
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <span>All stores</span>

                  {!storeFilter ? <span className="font-black">✓</span> : null}
                </Link>

                {storeFilterOptions.map((storeOption) => {
                  const isSelected =
                    storeFilter === storeOption.slug ||
                    storeFilter === storeOption.name;

                  return (
                    <Link
                      key={storeOption.id}
                      href={buildSearchUrl(
                        query,
                        1,
                        sort,
                        storeOption.slug,
                        categoryFilter,
                      )}
                      className={`
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }
                        `}
                    >
                      <span className="truncate pr-2">{storeOption.name}</span>

                      {isSelected ? (
                        <span className="font-black">✓</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY */}

            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-6
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

              <div className="mt-3 space-y-1.5">
                <Link
                  href={buildSearchUrl(query, 1, sort, storeFilter, "")}
                  className={`
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    ${
                      !categoryFilter
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <span>All categories</span>

                  {!categoryFilter ? (
                    <span className="font-black">✓</span>
                  ) : null}
                </Link>

                {CATEGORY_OPTIONS.map((categoryOption) => {
                  const isSelected =
                    categoryFilter.toLowerCase() ===
                    categoryOption.value.toLowerCase();

                  return (
                    <Link
                      key={categoryOption.value}
                      href={buildSearchUrl(
                        query,
                        1,
                        sort,
                        storeFilter,
                        categoryOption.value,
                      )}
                      className={`
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }
                        `}
                    >
                      <span>{categoryOption.label}</span>

                      {isSelected ? (
                        <span className="font-black">✓</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* SORT */}

            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-6
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

              <div className="mt-3 space-y-1.5">
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
                ].map((sortOption) => (
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
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        ${
                          sort === sortOption.value
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }
                      `}
                  >
                    <span>{sortOption.label}</span>

                    {sort === sortOption.value ? (
                      <span className="font-black">✓</span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ===================================================
              RESULTS
          =================================================== */}

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-3
              "
            >
              <div
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                {totalCount > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-black text-slate-900">
                      {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-slate-900">
                      {totalCount.toLocaleString()}
                    </span>{" "}
                    deals
                  </>
                ) : (
                  "No matching deals"
                )}
              </div>

              <div
                className="
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-slate-500
                "
              >
                {sort === "discount"
                  ? "Highest discount"
                  : sort === "price_low"
                    ? "Lowest price"
                    : sort === "newest"
                      ? "Newest"
                      : "Most relevant"}
              </div>
            </div>

            {/* EMPTY */}

            {coupons.length === 0 ? (
              <div
                className="
                  mt-5
                  rounded-[24px]
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-16
                  text-center
                  shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-100
                    text-2xl
                  "
                >
                  🔎
                </div>

                <h2
                  className="
                    mt-5
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-950
                  "
                >
                  No deals found
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Try removing one of the filters or search for a different
                  term.
                </p>

                <Link
                  href={buildSearchUrl(query, 1, "relevant", "", "")}
                  className="
                    mt-6
                    inline-flex
                    h-10
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
                    transition
                    hover:bg-emerald-600
                  "
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <>
                {/* GRID */}

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-3
                    sm:gap-4
                    lg:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="min-w-0">
                      <CouponCard coupon={coupon as any} />
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}

                {totalPages > 1 ? (
                  <nav
                    aria-label="Search pagination"
                    className="
                      mt-8
                      flex
                      flex-wrap
                      items-center
                      justify-center
                      gap-1.5
                    "
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={buildSearchUrl(
                          query,
                          currentPage - 1,
                          sort,
                          storeFilter,
                          categoryFilter,
                        )}
                        className="
                          inline-flex
                          h-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          text-xs
                          font-bold
                          text-slate-600
                          transition
                          hover:border-slate-300
                          hover:bg-slate-50
                        "
                      >
                        ←
                      </Link>
                    ) : (
                      <span
                        className="
                          inline-flex
                          h-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-100
                          bg-slate-50
                          px-3
                          text-xs
                          font-bold
                          text-slate-300
                        "
                      >
                        ←
                      </span>
                    )}

                    {paginationPages.map((pageItem, index) =>
                      pageItem === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="
                              px-1
                              text-xs
                              font-bold
                              text-slate-400
                            "
                        >
                          …
                        </span>
                      ) : (
                        <Link
                          key={pageItem}
                          href={buildSearchUrl(
                            query,
                            pageItem,
                            sort,
                            storeFilter,
                            categoryFilter,
                          )}
                          className={`
                              inline-flex
                              h-9
                              min-w-9
                              items-center
                              justify-center
                              rounded-xl
                              px-2.5
                              text-xs
                              font-black
                              transition
                              ${
                                pageItem === currentPage
                                  ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.16)]"
                                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }
                            `}
                        >
                          {pageItem}
                        </Link>
                      ),
                    )}

                    {currentPage < totalPages ? (
                      <Link
                        href={buildSearchUrl(
                          query,
                          currentPage + 1,
                          sort,
                          storeFilter,
                          categoryFilter,
                        )}
                        className="
                          inline-flex
                          h-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          text-xs
                          font-bold
                          text-slate-600
                          transition
                          hover:border-slate-300
                          hover:bg-slate-50
                        "
                      >
                        →
                      </Link>
                    ) : (
                      <span
                        className="
                          inline-flex
                          h-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-100
                          bg-slate-50
                          px-3
                          text-xs
                          font-bold
                          text-slate-300
                        "
                      >
                        →
                      </span>
                    )}
                  </nav>
                ) : null}

                {totalPages > 1 ? (
                  <div
                    className="
                      mt-3
                      text-center
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-slate-400
                    "
                  >
                    Page {currentPage} of {totalPages}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
