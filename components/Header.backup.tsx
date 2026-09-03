"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SavedLink from "@/components/SavedLink";

type SearchResult = {
  title: string;
  slug: string;
  store_name: string;
};

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const searchQuery = query.trim();

    if (!searchQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("title, slug, store_name")
        .or(`title.ilike.%${searchQuery}%,store_name.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) {
        console.error("Error searching coupons:", error);
        setResults([]);
        return;
      }

      setResults(data || []);
    };

    const timer = setTimeout(fetchResults, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <header className="relative z-50 w-full border-b border-gray-200 bg-white">
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <div className="border-b border-gray-200">
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-6xl
            items-center
            gap-4
            px-4
            py-3
            sm:px-6
            sm:py-4
            lg:px-8
          "
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/"
            onClick={closeMenu}
            className="
              shrink-0
              text-xl
              font-extrabold
              tracking-tight
              text-gray-900
              sm:text-2xl
            "
          >
            Deal<span className="text-green-600">Pilot</span>
          </Link>

          {/* =================================================
              DESKTOP SEARCH
          ================================================= */}

          <div
            className="
              relative
              hidden
              min-w-0
              flex-1
              md:block
            "
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coupons, stores..."
                aria-label="Search coupons and stores"
                className="
                  h-10
                  w-full
                  rounded-full
                  border
                  border-gray-300
                  bg-white
                  px-4
                  pr-10
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-100
                "
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-6
                    w-6
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    text-gray-400
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
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
                  top-full
                  mt-2
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-xl
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
                      border-gray-100
                      px-4
                      py-3
                      transition
                      last:border-b-0
                      hover:bg-gray-50
                    "
                  >
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {item.title}
                    </div>

                    <div className="mt-0.5 truncate text-xs text-gray-500">
                      {item.store_name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="
              hidden
              shrink-0
              items-center
              gap-5
              text-sm
              font-medium
              lg:flex
            "
          >
            <Link
              href="/stores"
              className="
                whitespace-nowrap
                text-gray-700
                transition-colors
                hover:text-green-600
              "
            >
              Stores
            </Link>

            <Link
              href="/coupons"
              className="
                whitespace-nowrap
                text-gray-700
                transition-colors
                hover:text-green-600
              "
            >
              Coupons
            </Link>

            <Link
              href="/deals"
              className="
                whitespace-nowrap
                text-gray-700
                transition-colors
                hover:text-green-600
              "
            >
              Deals
            </Link>

            <Link
              href="/categories"
              className="
                whitespace-nowrap
                text-gray-700
                transition-colors
                hover:text-green-600
              "
            >
              Categories
            </Link>

            <Link
              href="/blog"
              className="
                whitespace-nowrap
                text-gray-700
                transition-colors
                hover:text-green-600
              "
            >
              Blog
            </Link>

            <SavedLink />
          </nav>

          {/* =================================================
              TABLET / MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="
              ml-auto
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              transition
              hover:bg-gray-50
              lg:hidden
            "
          >
            {menuOpen ? (
              <span className="text-2xl leading-none">×</span>
            ) : (
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
                <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
                <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE SEARCH
      ===================================================== */}

      <div className="border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coupons, stores..."
            aria-label="Search coupons and stores"
            className="
              h-10
              w-full
              rounded-full
              border
              border-gray-300
              bg-gray-50
              px-4
              pr-10
              text-sm
              text-gray-900
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-green-500
              focus:bg-white
              focus:ring-2
              focus:ring-green-100
            "
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="
                absolute
                right-3
                top-1/2
                flex
                h-6
                w-6
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-gray-400
                hover:bg-gray-200
                hover:text-gray-700
              "
            >
              ×
            </button>
          )}

          {/* MOBILE SEARCH RESULTS */}

          {results.length > 0 && (
            <div
              className="
                absolute
                left-0
                right-0
                top-full
                z-50
                mt-2
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-xl
              "
            >
              {results.map((item, index) => (
                <Link
                  key={`${item.slug}-${index}`}
                  href={`/coupons/${item.slug}`}
                  onClick={() => {
                    clearSearch();
                    closeMenu();
                  }}
                  className="
                    block
                    border-b
                    border-gray-100
                    px-4
                    py-3
                    last:border-b-0
                    hover:bg-gray-50
                  "
                >
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {item.title}
                  </div>

                  <div className="mt-0.5 truncate text-xs text-gray-500">
                    {item.store_name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div
          className="
            border-b
            border-gray-200
            bg-white
            lg:hidden
          "
        >
          <nav className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex flex-col">
              <Link
                href="/stores"
                onClick={closeMenu}
                className="
                  border-b
                  border-gray-100
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                  hover:text-green-600
                "
              >
                Stores
              </Link>

              <Link
                href="/coupons"
                onClick={closeMenu}
                className="
                  border-b
                  border-gray-100
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                  hover:text-green-600
                "
              >
                Coupons
              </Link>

              <Link
                href="/deals"
                onClick={closeMenu}
                className="
                  border-b
                  border-gray-100
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                  hover:text-green-600
                "
              >
                Deals
              </Link>

              <Link
                href="/categories"
                onClick={closeMenu}
                className="
                  border-b
                  border-gray-100
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                  hover:text-green-600
                "
              >
                Categories
              </Link>

              <Link
                href="/blog"
                onClick={closeMenu}
                className="
                  border-b
                  border-gray-100
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                  hover:text-green-600
                "
              >
                Blog
              </Link>

              <div
                className="
                  px-1
                  py-3
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                <SavedLink />
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* =====================================================
          SECONDARY NAVIGATION - DESKTOP
      ===================================================== */}

      <div className="hidden border-b border-gray-200 bg-gray-50/70 md:block">
        <nav
          className="
            mx-auto
            flex
            w-full
            max-w-6xl
            items-center
            gap-x-7
            overflow-x-auto
            px-4
            py-2.5
            text-sm
            font-medium
            text-gray-600
            sm:px-6
            lg:px-8
            [&::-webkit-scrollbar]:hidden
          "
        >
          <Link
            href="/trending"
            className="
              flex
              shrink-0
              items-center
              gap-1
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            🔥 Trending Now
          </Link>

          <Link
            href="/top-brands"
            className="
              flex
              shrink-0
              items-center
              gap-1
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            💎 Top Brands
          </Link>

          <Link
            href="/promo-codes"
            className="
              flex
              shrink-0
              items-center
              gap-1
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            🏷️ Promo Codes
          </Link>

          <Link
            href="/categories/school-supplies"
            className="
              shrink-0
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            School Supplies
          </Link>

          <Link
            href="/deals/50-off"
            className="
              shrink-0
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            Over 50% Off
          </Link>

          <Link
            href="/categories/furniture"
            className="
              shrink-0
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            Furniture
          </Link>

          <Link
            href="/categories/beauty"
            className="
              shrink-0
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            Beauty
          </Link>

          <Link
            href="/categories/household"
            className="
              shrink-0
              whitespace-nowrap
              transition-colors
              hover:text-green-600
            "
          >
            Household
          </Link>
        </nav>
      </div>
    </header>
  );
}
