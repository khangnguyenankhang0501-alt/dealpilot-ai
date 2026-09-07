"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SavedLink from "@/components/SavedLink";

type SearchResult = {
  title: string;
  slug: string;
  store_name: string | null;
};

const mainNavigation = [
  {
    label: "Coupons",
    href: "/coupons",
  },
];

function isNavigationActive(pathname: string, href: string) {
  if (href === "/coupons") {
    return pathname === "/coupons" || pathname.startsWith("/coupons/");
  }

  return pathname === href;
}

export default function Header() {
  const pathname = usePathname();

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
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
              grid-cols-[190px_minmax(280px,1fr)_220px]
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

              <span
                className="
                  ml-2
                  hidden
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-emerald-600
                  xl:inline-flex
                "
              >
                Deals
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

              {/* SEARCH RESULTS */}

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
                    shadow-[0_20px_50px_rgba(15,23,42,0.14)]
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

            {/* ===================================================
                MAIN NAVIGATION
            =================================================== */}

            <nav
              className="
                flex
                items-center
                justify-self-end
              "
            >
              <div
                className="
                  grid
                  w-[220px]
                  grid-cols-2
                  gap-2
                "
              >
                {/* COUPONS */}

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
                    flex
                    min-h-[44px]
                    items-center
                    justify-center
                    rounded-xl
                    transition-colors
                    hover:bg-slate-50
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
                  shadow-[0_18px_45px_rgba(15,23,42,0.14)]
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
              <div className="grid grid-cols-2 gap-2">
                {/* COUPONS */}

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
