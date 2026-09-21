"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SavedLink from "@/components/SavedLink";

type SearchResult = {
  id: string | number;
  title: string | null;
  slug: string | null;
  store_name: string | null;
  image_url: string | null;
  sale_price: number | string | null;
  original_price: number | string | null;
  discount_value: number | string | null;
};

const mainNavigation = [
  {
    label: "Stores",
    href: "/stores",
  },
  {
    label: "Coupons",
    href: "/coupons",
  },
  {
    label: "Deals",
    href: "/deals",
  },
  {
    label: "Categories",
    href: "/categories",
  },
];

function isNavigationActive(pathname: string, href: string) {
  if (href === "/stores") {
    return pathname === "/stores" || pathname.startsWith("/stores/");
  }

  if (href === "/coupons") {
    return pathname === "/coupons" || pathname.startsWith("/coupons/");
  }

  if (href === "/deals") {
    return pathname === "/deals" || pathname.startsWith("/deals/");
  }

  if (href === "/categories") {
    return pathname === "/categories" || pathname.startsWith("/categories/");
  }

  return pathname === href;
}

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return `$${numberValue.toFixed(2)}`;
}

function formatDiscount(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return `${numberValue}% OFF`;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    const fetchResults = async () => {
      const safeQuery = searchQuery.replace(/[%_,]/g, "").trim();

      if (!safeQuery) {
        setResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      try {
        const { data, error } = await supabase
          .from("coupons")
          .select(
            `
              id,
              title,
              slug,
              store_name,
              image_url,
              sale_price,
              original_price,
              discount_value
            `,
          )
          .eq("status", "Active")
          .or(`title.ilike.%${safeQuery}%,store_name.ilike.%${safeQuery}%`)
          .limit(6);

        if (error) {
          console.error("Search error:", error);

          setResults([]);
          return;
        }

        setResults((data ?? []) as SearchResult[]);
      } catch (error) {
        console.error("Unexpected search error:", error);

        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchFocused(false);
  };

  const submitSearch = () => {
    const searchValue = query.trim();

    if (!searchValue) {
      return;
    }

    setResults([]);
    setSearchFocused(false);

    router.push(`/search?q=${encodeURIComponent(searchValue)}`);
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-slate-200/80
        bg-white/95
        backdrop-blur-xl
      "
    >
      {/* =========================================================
          DESKTOP / TABLET
      ========================================================= */}

      <div className="hidden md:block">
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-4
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              grid
              min-h-[76px]
              grid-cols-[190px_minmax(280px,1fr)_auto]
              items-center
              gap-6
              xl:gap-8
            "
          >
            {/* ===================================================
                LOGO
            =================================================== */}

            <Link
              href="/"
              className="group flex w-fit items-center"
              aria-label="DealPilot Home"
            >
              <span
                className="
                  text-[25px]
                  font-black
                  tracking-[-0.055em]
                  text-slate-950
                "
              >
                Deal
                <span
                  className="
                    text-emerald-500
                    transition-colors
                    duration-200
                    group-hover:text-emerald-600
                  "
                >
                  Pilot
                </span>
              </span>
            </Link>

            {/* ===================================================
                SEARCH
            =================================================== */}

            <div className="relative mx-auto w-full max-w-[600px]">
              <div
                className={`
                  flex
                  h-12
                  w-full
                  items-center
                  rounded-2xl
                  border
                  bg-slate-50/80
                  transition-all
                  duration-200

                  ${
                    searchFocused
                      ? "border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_8px_25px_rgba(15,23,42,0.06)]"
                      : "border-slate-200 hover:border-slate-300 hover:bg-white"
                  }
                `}
              >
                <span
                  className="
                    flex
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    text-base
                    text-slate-400
                  "
                >
                  🔍
                </span>

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchFocused(false);
                    }, 150);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      submitSearch();
                    }

                    if (event.key === "Escape") {
                      clearSearch();
                    }
                  }}
                  placeholder="Search coupons, stores..."
                  className="
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    pr-2
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                  aria-label="Search coupons and stores"
                />

                {query && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={clearSearch}
                    className="
                      mr-2
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-base
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* =================================================
                  DESKTOP SEARCH RESULTS
              ================================================= */}

              {query.trim() && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[calc(100%+10px)]
                    z-50
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_20px_50px_rgba(15,23,42,0.14)]
                  "
                >
                  {searchLoading && (
                    <div
                      className="
                        px-5
                        py-5
                        text-sm
                        font-medium
                        text-slate-500
                      "
                    >
                      Searching...
                    </div>
                  )}

                  {!searchLoading &&
                    results.length > 0 &&
                    results.map((item, index) => {
                      const salePrice = formatPrice(item.sale_price);

                      const originalPrice = formatPrice(item.original_price);

                      const discount = formatDiscount(item.discount_value);

                      const href = item.slug
                        ? `/coupons/${encodeURIComponent(item.slug)}`
                        : "#";

                      return (
                        <Link
                          key={`${String(item.id)}-${index}`}
                          href={href}
                          onClick={() => clearSearch()}
                          className="
                              group
                              flex
                              min-h-[82px]
                              items-center
                              gap-3
                              border-b
                              border-slate-100
                              px-4
                              py-3
                              transition-colors
                              last:border-b-0
                              hover:bg-slate-50
                            "
                        >
                          {/* IMAGE */}

                          <div
                            className="
                                relative
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                              "
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title || "Product"}
                                className="
                                    h-full
                                    w-full
                                    object-contain
                                    p-1
                                    transition-transform
                                    duration-200
                                    group-hover:scale-105
                                  "
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-xl">🏷️</span>
                            )}
                          </div>

                          {/* PRODUCT INFO */}

                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                  line-clamp-1
                                  text-sm
                                  font-black
                                  leading-5
                                  text-slate-900
                                "
                            >
                              {item.title || "Special Deal"}
                            </div>

                            <div
                              className="
                                  mt-0.5
                                  truncate
                                  text-xs
                                  font-medium
                                  text-slate-500
                                "
                            >
                              {item.store_name || "Store"}
                            </div>

                            <div
                              className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-2
                                "
                            >
                              {salePrice && (
                                <span
                                  className="
                                      text-sm
                                      font-black
                                      text-slate-950
                                    "
                                >
                                  {salePrice}
                                </span>
                              )}

                              {originalPrice && (
                                <span
                                  className="
                                      text-[10px]
                                      font-semibold
                                      text-slate-400
                                      line-through
                                    "
                                >
                                  {originalPrice}
                                </span>
                              )}

                              {discount && (
                                <span
                                  className="
                                      rounded-full
                                      bg-emerald-500
                                      px-2
                                      py-0.5
                                      text-[9px]
                                      font-black
                                      text-white
                                    "
                                >
                                  {discount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ARROW */}

                          <span
                            className="
                                shrink-0
                                text-lg
                                font-medium
                                text-slate-300
                                transition
                                group-hover:translate-x-0.5
                                group-hover:text-emerald-500
                              "
                          >
                            →
                          </span>
                        </Link>
                      );
                    })}

                  {!searchLoading && query.trim() && results.length === 0 && (
                    <div
                      className="
                          px-5
                          py-5
                          text-sm
                          font-medium
                          text-slate-500
                        "
                    >
                      No results
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===================================================
                MAIN NAVIGATION
            =================================================== */}

            <nav
              className="
                flex
                items-center
                justify-self-end
                whitespace-nowrap
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1
                  lg:gap-2
                "
              >
                {mainNavigation.map((item) => {
                  const active = isNavigationActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                          relative
                          flex
                          min-h-[44px]
                          items-center
                          justify-center
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-bold
                          transition-all
                          duration-200

                          ${
                            active
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                          }
                        `}
                    >
                      {item.label}

                      {active && (
                        <span
                          className="
                              absolute
                              bottom-1
                              left-1/2
                              h-1
                              w-1
                              -translate-x-1/2
                              rounded-full
                              bg-emerald-500
                            "
                        />
                      )}
                    </Link>
                  );
                })}

                {/* SAVED */}

                <div
                  className="
                    ml-1
                    flex
                    min-h-[44px]
                    items-center
                    justify-center
                    border-l
                    border-slate-200
                    pl-3
                  "
                >
                  <SavedLink />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* =========================================================
          MOBILE
      ========================================================= */}

      <div className="md:hidden">
        {/* MOBILE TOP ROW */}

        <div
          className="
            flex
            h-[64px]
            items-center
            justify-between
            px-4
          "
        >
          {/* LOGO */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="DealPilot Home"
            className="group flex shrink-0 items-center"
          >
            <span
              className="
                text-[23px]
                font-black
                tracking-[-0.05em]
                text-slate-950
              "
            >
              Deal
              <span
                className="
                  text-emerald-500
                  transition-colors
                  duration-200
                  group-hover:text-emerald-600
                "
              >
                Pilot
              </span>
            </span>
          </Link>

          {/* ACTIONS */}

          <div className="flex items-center gap-1.5">
            {/* SAVED */}

            <Link
              href="/saved"
              onClick={closeMobileMenu}
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-xl
                transition

                ${
                  pathname === "/saved" || pathname.startsWith("/saved/")
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                }
              `}
              aria-label="Saved coupons"
            >
              ♡
            </Link>

            {/* MENU */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-lg
                font-medium
                text-slate-800
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        <div className="px-4 pb-3">
          <div
            className={`
              flex
              h-11
              items-center
              rounded-2xl
              border
              bg-slate-50/80
              transition-all

              ${
                searchFocused
                  ? "border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                  : "border-slate-200"
              }
            `}
          >
            <span
              className="
                flex
                w-10
                shrink-0
                items-center
                justify-center
                text-[15px]
                text-slate-400
              "
            >
              🔍
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => {
                  setSearchFocused(false);
                }, 150);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }

                if (event.key === "Escape") {
                  clearSearch();
                }
              }}
              placeholder="Search coupons, stores..."
              className="
                h-full
                min-w-0
                flex-1
                bg-transparent
                px-1
                text-sm
                font-medium
                text-slate-800
                outline-none
                placeholder:text-slate-400
              "
              aria-label="Search coupons and stores"
            />

            {query && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearSearch}
                className="
                  mr-2
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-sm
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* MOBILE SEARCH RESULTS */}

          {query.trim() && (
            <div className="relative z-50">
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-2
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_18px_45px_rgba(15,23,42,0.14)]
                "
              >
                {searchLoading && (
                  <div
                    className="
                      px-4
                      py-4
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    Searching...
                  </div>
                )}

                {!searchLoading &&
                  results.length > 0 &&
                  results.map((item, index) => {
                    const salePrice = formatPrice(item.sale_price);

                    const discount = formatDiscount(item.discount_value);

                    const href = item.slug
                      ? `/coupons/${encodeURIComponent(item.slug)}`
                      : "#";

                    return (
                      <Link
                        key={`${String(item.id)}-${index}`}
                        href={href}
                        onClick={clearSearch}
                        className="
                            group
                            flex
                            min-h-[72px]
                            items-center
                            gap-3
                            border-b
                            border-slate-100
                            px-3
                            py-2.5
                            last:border-b-0
                            hover:bg-slate-50
                          "
                      >
                        {/* IMAGE */}

                        <div
                          className="
                              flex
                              h-12
                              w-12
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                            "
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title || "Product"}
                              className="
                                  h-full
                                  w-full
                                  object-contain
                                  p-1
                                "
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-lg">🏷️</span>
                          )}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div
                            className="
                                line-clamp-1
                                text-xs
                                font-black
                                text-slate-900
                              "
                          >
                            {item.title || "Special Deal"}
                          </div>

                          <div
                            className="
                                mt-0.5
                                truncate
                                text-[10px]
                                font-medium
                                text-slate-500
                              "
                          >
                            {item.store_name || "Store"}
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            {salePrice && (
                              <span
                                className="
                                    text-xs
                                    font-black
                                    text-slate-950
                                  "
                              >
                                {salePrice}
                              </span>
                            )}

                            {discount && (
                              <span
                                className="
                                    rounded-full
                                    bg-emerald-500
                                    px-1.5
                                    py-0.5
                                    text-[8px]
                                    font-black
                                    text-white
                                  "
                              >
                                {discount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ARROW */}

                        <span
                          className="
                              shrink-0
                              text-slate-300
                              transition
                              group-hover:text-emerald-500
                            "
                        >
                          →
                        </span>
                      </Link>
                    );
                  })}

                {!searchLoading && query.trim() && results.length === 0 && (
                  <div
                    className="
                        px-4
                        py-4
                        text-sm
                        font-medium
                        text-slate-500
                      "
                  >
                    No results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE MENU */}

        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-slate-200
              bg-white
              shadow-[0_12px_30px_rgba(15,23,42,0.08)]
            "
          >
            <nav className="px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {/* MAIN LINKS */}

                {mainNavigation.map((item) => {
                  const active = isNavigationActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`
                          flex
                          min-h-[46px]
                          items-center
                          justify-center
                          rounded-xl
                          border
                          px-4
                          py-3
                          text-sm
                          font-bold
                          transition

                          ${
                            active
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-slate-100 bg-slate-50 text-slate-800 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                          }
                        `}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* SAVED */}

                <Link
                  href="/saved"
                  onClick={closeMobileMenu}
                  className={`
                    flex
                    min-h-[46px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-bold
                    transition

                    ${
                      pathname === "/saved" || pathname.startsWith("/saved/")
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-slate-50 text-slate-800 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                    }
                  `}
                >
                  ♡ Saved
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
