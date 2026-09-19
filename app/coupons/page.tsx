import Link from "next/link";
import { redirect } from "next/navigation";
import CouponCard from "@/components/CouponCard";
import CouponFilterBar from "@/components/CouponFilterBar";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  q?: string | string[];
  store?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type Coupon = {
  id: string;
  title?: string | null;
  slug?: string | null;

  store_name?: string | null;
  store_id?: string | null;

  image_url?: string | null;

  coupon_code?: string | null;
  affiliate_url?: string | null;

  discount_value?: number | string | null;

  original_price?: number | string | null;
  sale_price?: number | string | null;

  status?: string | null;
  expires_at?: string | null;

  verified?: boolean | null;

  rating?: number | string | null;
  review_count?: number | string | null;

  popularity_count?: number | string | null;
  click_count?: number | string | null;

  shipping_text?: string | null;
  sold_text?: string | null;

  badge?: string | null;
  is_exclusive?: boolean | null;

  created_at?: string | null;

  stores?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    logo_url?: string | null;
  } | null;
};

type Store = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
};

const categories = [
  {
    label: "All categories",
    value: "",
  },
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

const PAGE_SIZE = 24;

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getSafePage(value: string) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.max(1, Math.floor(numberValue));
}

function buildPageHref({
  query,
  store,
  category,
  sort,
  page,
}: {
  query: string;
  store: string;
  category: string;
  sort: string;
  page: number;
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

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/coupons?${queryString}` : "/coupons";
}

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ");
}

type PaginationItem =
  | {
      type: "page";
      page: number;
    }
  | {
      type: "ellipsis";
      key: string;
    };

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page" as const,
      page: index + 1,
    }));
  }

  const items: PaginationItem[] = [];

  items.push({
    type: "page",
    page: 1,
  });

  if (currentPage > 4) {
    items.push({
      type: "ellipsis",
      key: "start-ellipsis",
    });
  }

  const start = Math.max(2, currentPage - 1);

  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    items.push({
      type: "page",
      page,
    });
  }

  if (currentPage < totalPages - 3) {
    items.push({
      type: "ellipsis",
      key: "end-ellipsis",
    });
  }

  items.push({
    type: "page",
    page: totalPages,
  });

  return items;
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query = getParamValue(params.q).trim();

  const selectedStore = getParamValue(params.store).trim();

  const selectedCategory = getParamValue(params.category).trim();

  const selectedSort = getParamValue(params.sort).trim() || "newest";

  const currentPage = getSafePage(getParamValue(params.page));

  /*
   * Load stores for the filter dropdown.
   */

  const { data: storeRows } = await supabase
    .from("stores")
    .select("id,name,slug,logo_url")
    .order("name", {
      ascending: true,
    });

  const stores = (storeRows || []) as Store[];

  const activeStore = selectedStore
    ? stores.find((store) => store.slug === selectedStore)
    : null;

  /*
   * Current time is used so expired coupons
   * never appear in the directory.
   */

  const now = new Date().toISOString();

  /*
   * Base query.
   */

  let baseQuery = supabase
    .from("coupons")
    .select(
      `
        *,
        stores!coupons_store_id_fkey(
          id,
          name,
          slug,
          logo_url
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${now}`);

  /*
   * SEARCH
   */

  if (query) {
    const searchTerm = sanitizeSearchTerm(query);

    if (searchTerm) {
      baseQuery = baseQuery.or(
        `title.ilike.%${searchTerm}%,store_name.ilike.%${searchTerm}%`,
      );
    }
  }

  /*
   * STORE
   */

  if (selectedStore) {
    if (activeStore?.id) {
      baseQuery = baseQuery.eq("store_id", activeStore.id);
    } else {
      baseQuery = baseQuery.eq("store_id", "__invalid_store__");
    }
  }

  /*
   * CATEGORY
   */

  if (selectedCategory) {
    baseQuery = baseQuery.ilike("category", selectedCategory);
  }

  /*
   * SORT
   */

  switch (selectedSort) {
    case "popular":
      baseQuery = baseQuery
        .order("popularity_count", {
          ascending: false,
          nullsFirst: false,
        })
        .order("click_count", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });
      break;

    case "discount":
      baseQuery = baseQuery
        .order("discount_value", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });
      break;

    case "clicks":
      baseQuery = baseQuery
        .order("click_count", {
          ascending: false,
          nullsFirst: false,
        })
        .order("popularity_count", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });
      break;

    case "newest":
    default:
      baseQuery = baseQuery.order("created_at", {
        ascending: false,
      });
      break;
  }

  /*
   * PAGINATION
   */

  const from = (currentPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE - 1;

  const { data: couponRows, error, count } = await baseQuery.range(from, to);

  const totalCount = count || 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /*
   * If someone requests a page beyond the
   * available range, redirect to the last
   * valid page while preserving all filters.
   */

  if (totalCount > 0 && currentPage > totalPages) {
    redirect(
      buildPageHref({
        query,
        store: selectedStore,
        category: selectedCategory,
        sort: selectedSort,
        page: totalPages,
      }),
    );
  }

  const coupons = (couponRows || []) as Coupon[];

  const rangeStart = totalCount === 0 ? 0 : from + 1;

  const rangeEnd =
    totalCount === 0 ? 0 : Math.min(from + coupons.length, totalCount);

  /*
   * DATABASE ERROR
   */

  if (error) {
    throw new Error(error.message || "Failed to load coupons.");
  }

  const storeFilterOptions = stores
    .filter((store) => Boolean(store.name) && Boolean(store.slug))
    .map((store) => ({
      name: store.name as string,
      slug: store.slug as string,
    }));

  /*
   * Structured data.
   */

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Coupons & Promo Codes | DealPilot",
    description:
      "Browse active coupon codes, promo codes, discounts and deals from top stores on DealPilot.",
    url: `${siteUrl}/coupons`,
    isPartOf: {
      "@type": "WebSite",
      name: "DealPilot",
      url: siteUrl,
    },
  };

  /*
   * PAGINATION ITEMS
   */

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  const previousHref =
    currentPage > 1
      ? buildPageHref({
          query,
          store: selectedStore,
          category: selectedCategory,
          sort: selectedSort,
          page: currentPage - 1,
        })
      : null;

  const nextHref =
    currentPage < totalPages
      ? buildPageHref({
          query,
          store: selectedStore,
          category: selectedCategory,
          sort: selectedSort,
          page: currentPage + 1,
        })
      : null;

  const firstHref =
    currentPage > 1
      ? buildPageHref({
          query,
          store: selectedStore,
          category: selectedCategory,
          sort: selectedSort,
          page: 1,
        })
      : null;

  const lastHref =
    currentPage < totalPages
      ? buildPageHref({
          query,
          store: selectedStore,
          category: selectedCategory,
          sort: selectedSort,
          page: totalPages,
        })
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* HEADER */}

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                DealPilot coupons
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Coupon codes & deals
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse active promo codes, discounts and deals from stores on
                DealPilot.
              </p>
            </div>

            {totalCount > 0 ? (
              <div className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500 shadow-sm sm:block">
                {totalCount.toLocaleString()} deals
              </div>
            ) : null}
          </div>

          {/* FILTER BAR */}

          <div className="mt-7">
            <CouponFilterBar
              query={query}
              store={selectedStore}
              category={selectedCategory}
              sort={selectedSort}
              stores={storeFilterOptions}
              categories={categories}
            />
          </div>

          {/* RESULT META */}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-500">
              {totalCount > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-black text-slate-900">
                    {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-slate-900">
                    {totalCount.toLocaleString()}
                  </span>
                </>
              ) : (
                "No matching coupons"
              )}
            </div>

            {selectedStore ||
            selectedCategory ||
            query ||
            selectedSort !== "newest" ? (
              <Link
                href="/coupons"
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-emerald-600
                  transition
                  hover:text-emerald-700
                "
              >
                Reset filters
              </Link>
            ) : null}
          </div>

          {/* EMPTY STATE */}

          {coupons.length === 0 ? (
            <div
              className="
                mt-5
                rounded-[24px]
                border
                border-slate-200
                bg-white
                px-6
                py-14
                text-center
                shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                sm:px-10
                sm:py-16
              "
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔎
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                No coupons found
              </h2>

              {query ? (
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  No active coupons matched{" "}
                  <span className="font-bold text-slate-700">“{query}”</span>
                  {selectedStore
                    ? ` from ${activeStore?.name || selectedStore}`
                    : ""}
                  {selectedCategory ? ` in ${selectedCategory}` : ""}.
                </p>
              ) : selectedStore || selectedCategory ? (
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  No active coupons match the selected filters. Try removing a
                  filter or browse the full coupon directory.
                </p>
              ) : (
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  There are no active coupons matching the current view right
                  now. Check back later for new offers.
                </p>
              )}

              {/* ACTIVE FILTER SUMMARY */}

              {query ||
              selectedStore ||
              selectedCategory ||
              selectedSort !== "newest" ? (
                <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2">
                  {query ? (
                    <span
                      className="
                        rounded-full
                        border
                        border-emerald-100
                        bg-emerald-50
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        text-emerald-700
                      "
                    >
                      Search: {query}
                    </span>
                  ) : null}

                  {selectedStore ? (
                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        text-slate-700
                      "
                    >
                      Store: {activeStore?.name || selectedStore}
                    </span>
                  ) : null}

                  {selectedCategory ? (
                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        text-slate-700
                      "
                    >
                      Category: {selectedCategory}
                    </span>
                  ) : null}

                  {selectedSort !== "newest" ? (
                    <span
                      className="
                        rounded-full
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        text-slate-700
                      "
                    >
                      Sort:{" "}
                      {selectedSort === "popular"
                        ? "Most popular"
                        : selectedSort === "discount"
                          ? "Highest discount"
                          : selectedSort === "clicks"
                            ? "Most clicked"
                            : selectedSort}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <Link
                href="/coupons"
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
                  shadow-[0_8px_20px_rgba(16,185,129,0.16)]
                  transition
                  hover:bg-emerald-600
                "
              >
                Clear all filters
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
                  sm:grid-cols-2
                  sm:gap-4
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="min-w-0">
                    <CouponCard coupon={coupon} />
                  </div>
                ))}
              </div>

              {/* PAGINATION */}

              {totalPages > 1 ? (
                <nav
                  aria-label="Coupon pagination"
                  className="
                    mt-8
                    rounded-[18px]
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-3
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:px-4
                  "
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-left">
                      Page{" "}
                      <span className="font-black text-slate-700">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-black text-slate-700">
                        {totalPages}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      {/* FIRST */}

                      {firstHref ? (
                        <Link
                          href={firstHref}
                          aria-label="First page"
                          className="
                            hidden
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-emerald-700
                            md:inline-flex
                          "
                        >
                          First
                        </Link>
                      ) : (
                        <span
                          className="
                            hidden
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-100
                            bg-slate-50
                            px-2.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-300
                            md:inline-flex
                          "
                        >
                          First
                        </span>
                      )}

                      {/* PREVIOUS */}

                      {previousHref ? (
                        <Link
                          href={previousHref}
                          aria-label="Previous page"
                          className="
                            inline-flex
                            h-9
                            min-w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-bold
                            text-slate-600
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-emerald-700
                          "
                        >
                          ←
                        </Link>
                      ) : (
                        <span
                          className="
                            inline-flex
                            h-9
                            min-w-9
                            cursor-not-allowed
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-100
                            bg-slate-50
                            px-3
                            text-sm
                            font-bold
                            text-slate-300
                          "
                        >
                          ←
                        </span>
                      )}

                      {/* PAGE NUMBERS */}

                      {paginationItems.map((item) => {
                        if (item.type === "ellipsis") {
                          return (
                            <span
                              key={item.key}
                              className="
                                inline-flex
                                h-9
                                min-w-7
                                items-center
                                justify-center
                                text-sm
                                font-black
                                text-slate-300
                              "
                            >
                              …
                            </span>
                          );
                        }

                        const active = item.page === currentPage;

                        return (
                          <Link
                            key={item.page}
                            href={buildPageHref({
                              query,
                              store: selectedStore,
                              category: selectedCategory,
                              sort: selectedSort,
                              page: item.page,
                            })}
                            aria-current={active ? "page" : undefined}
                            className={`
                              inline-flex
                              h-9
                              min-w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              px-2.5
                              text-[11px]
                              font-black
                              transition
                              ${
                                active
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_6px_15px_rgba(16,185,129,0.16)]"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              }
                            `}
                          >
                            {item.page}
                          </Link>
                        );
                      })}

                      {/* NEXT */}

                      {nextHref ? (
                        <Link
                          href={nextHref}
                          aria-label="Next page"
                          className="
                            inline-flex
                            h-9
                            min-w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-bold
                            text-slate-600
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-emerald-700
                          "
                        >
                          →
                        </Link>
                      ) : (
                        <span
                          className="
                            inline-flex
                            h-9
                            min-w-9
                            cursor-not-allowed
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-100
                            bg-slate-50
                            px-3
                            text-sm
                            font-bold
                            text-slate-300
                          "
                        >
                          →
                        </span>
                      )}

                      {/* LAST */}

                      {lastHref ? (
                        <Link
                          href={lastHref}
                          aria-label="Last page"
                          className="
                            hidden
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-500
                            transition
                            hover:border-emerald-200
                            hover:bg-emerald-50
                            hover:text-emerald-700
                            md:inline-flex
                          "
                        >
                          Last
                        </Link>
                      ) : (
                        <span
                          className="
                            hidden
                            h-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-100
                            bg-slate-50
                            px-2.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wide
                            text-slate-300
                            md:inline-flex
                          "
                        >
                          Last
                        </span>
                      )}
                    </div>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </main>
    </>
  );
}
