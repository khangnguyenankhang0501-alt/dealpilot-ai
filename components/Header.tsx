"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SavedLink from "@/components/SavedLink";

type SearchResult = {
  title: string;
  slug: string;
  store_name: string | null;
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

/*
 * Secondary navigation đã được ẩn hoàn toàn.
 */

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const safeQuery = searchQuery.replace(/[%_,]/g, "");

      if (!safeQuery) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("coupons")
        .select("title, slug, store_name")
        .or(`title.ilike.%${safeQuery}%,store_name.ilike.%${safeQuery}%`)
        .limit(6);

      if (error) {
        console.error("Search error:", error);
        setResults([]);
        return;
      }

      setResults(data ?? []);
    };

    const timer = setTimeout(fetchResults, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* =========================================================
          DESKTOP / TABLET
      ========================================================= */}

      <div className="hidden md:block">
        {/* MAIN HEADER */}

        <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
          <div className="flex min-h-[72px] items-center gap-5">
            {/* LOGO */}

            <Link
              href="/"
              className="group shrink-0"
              aria-label="DealPilot Home"
            >
              <span className="text-[23px] font-extrabold tracking-[-0.04em] text-slate-900">
                Deal
                <span className="text-emerald-500 transition-colors group-hover:text-emerald-600">
                  Pilot
                </span>
              </span>
            </Link>

            {/* SEARCH */}

            <div className="relative min-w-0 max-w-[430px] flex-1">
              <div
                className={`
                  flex h-11 items-center rounded-full border
                  bg-slate-50/70
                  transition-all duration-200
                  ${
                    searchFocused
                      ? "border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                      : "border-slate-200 hover:border-slate-300 hover:bg-white"
                  }
                `}
              >
                {/* SEARCH ICON */}

                <span className="flex w-10 shrink-0 items-center justify-center text-[15px] text-slate-400">
                  🔍
                </span>

                {/* INPUT */}

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setSearchFocused(false), 150);
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

                {/* CLEAR */}

                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="
                      mr-2
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-sm
                      text-slate-400
                      transition
                      hover:bg-slate-200
                      hover:text-slate-700
                    "
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* DESKTOP SEARCH RESULTS */}

              {results.length > 0 && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[calc(100%+10px)]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_16px_45px_rgba(15,23,42,0.12)]
                  "
                >
                  {results.map((item, index) => (
                    <Link
                      key={`${item.slug}-${index}`}
                      href={`/coupons/${item.slug}`}
                      onClick={clearSearch}
                      className="
                        block
                        border-b
                        border-slate-100
                        px-4
                        py-3.5
                        transition-colors
                        last:border-b-0
                        hover:bg-emerald-50/50
                      "
                    >
                      <div className="truncate text-sm font-bold text-slate-900">
                        {item.title}
                      </div>

                      <div className="mt-1 truncate text-xs font-medium text-slate-500">
                        {item.store_name || "Store"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* MAIN NAVIGATION */}

            <nav className="ml-auto flex shrink-0 items-center gap-3 lg:gap-4">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    whitespace-nowrap
                    rounded-lg
                    px-2
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    transition-all
                    duration-200
                    hover:bg-slate-50
                    hover:text-emerald-600
                  "
                >
                  {item.label}
                </Link>
              ))}

              {/* SAVED */}

              <div className="ml-1 border-l border-slate-200 pl-3">
                <SavedLink />
              </div>
            </nav>
          </div>
        </div>

        {/* SECONDARY NAVIGATION
            ĐÃ ẨN HOÀN TOÀN */}
      </div>

      {/* =========================================================
          MOBILE
      ========================================================= */}

      <div className="md:hidden">
        {/* MOBILE TOP ROW */}

        <div className="flex h-[62px] items-center justify-between px-4">
          {/* LOGO */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="DealPilot Home"
            className="group shrink-0"
          >
            <span className="text-[22px] font-extrabold tracking-[-0.04em] text-slate-900">
              Deal
              <span className="text-emerald-500 transition-colors group-hover:text-emerald-600">
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
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-xl
                text-slate-600
                transition
                hover:bg-slate-100
                hover:text-emerald-600
              "
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
                text-xl
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
              rounded-full
              border
              bg-slate-50/70
              transition-all
              ${
                searchFocused
                  ? "border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                  : "border-slate-200"
              }
            `}
          >
            <span className="flex w-10 shrink-0 items-center justify-center text-[15px] text-slate-400">
              🔍
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setSearchFocused(false), 150);
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
                onClick={clearSearch}
                className="
                  mr-2
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-sm
                  text-slate-400
                  transition
                  hover:bg-slate-200
                  hover:text-slate-700
                "
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* MOBILE SEARCH RESULTS */}

          {results.length > 0 && (
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
                  shadow-[0_16px_40px_rgba(15,23,42,0.14)]
                "
              >
                {results.map((item, index) => (
                  <Link
                    key={`${item.slug}-${index}`}
                    href={`/coupons/${item.slug}`}
                    onClick={clearSearch}
                    className="
                      block
                      border-b
                      border-slate-100
                      px-4
                      py-3.5
                      transition-colors
                      last:border-b-0
                      hover:bg-emerald-50/50
                    "
                  >
                    <div className="truncate text-sm font-bold text-slate-900">
                      {item.title}
                    </div>

                    <div className="mt-1 truncate text-xs font-medium text-slate-500">
                      {item.store_name || "Store"}
                    </div>
                  </Link>
                ))}
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
              {/* MAIN LINKS */}

              <div className="grid grid-cols-2 gap-2">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="
                      rounded-xl
                      border
                      border-slate-100
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      font-bold
                      text-slate-800
                      transition
                      hover:border-emerald-100
                      hover:bg-emerald-50
                      hover:text-emerald-700
                    "
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/saved"
                  onClick={closeMobileMenu}
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-slate-800
                    transition
                    hover:border-emerald-100
                    hover:bg-emerald-50
                    hover:text-emerald-700
                  "
                >
                  ♡ Saved
                </Link>
              </div>

              {/* SECONDARY MENU ĐÃ XÓA */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
