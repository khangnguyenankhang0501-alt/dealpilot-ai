"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  {
    label: "Blog",
    href: "/blog",
  },
];

const secondaryNavigation = [
  {
    label: "🔥 Trending Now",
    href: "/trending",
  },
  {
    label: "💎 Top Brands",
    href: "/top-brands",
  },
  {
    label: "🏷️ Promo Codes",
    href: "/promo-codes",
  },
  {
    label: "School Supplies",
    href: "/categories/school-supplies",
  },
  {
    label: "Over 50% Off",
    href: "/deals/50-off",
  },
  {
    label: "Furniture",
    href: "/categories/furniture",
  },
  {
    label: "Beauty",
    href: "/categories/beauty",
  },
  {
    label: "Household",
    href: "/categories/household",
  },
];

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
    <header className="relative z-50 w-full border-b border-slate-200 bg-white">
      {/* =====================================================
            DESKTOP / TABLET HEADER
        ====================================================== */}

      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
          <div className="flex min-h-[70px] items-center gap-5">
            {/* LOGO */}

            <Link href="/" className="shrink-0" aria-label="DealPilot Home">
              <span className="text-[22px] font-extrabold tracking-tight text-slate-900">
                Deal<span className="text-emerald-500">Pilot</span>
              </span>
            </Link>

            {/* DESKTOP SEARCH */}

            <div className="relative min-w-0 flex-1 max-w-[440px]">
              <div
                className={`flex h-10 items-center rounded-full border bg-white transition ${
                  searchFocused
                    ? "border-emerald-500 ring-2 ring-emerald-500/10"
                    : "border-slate-300"
                }`}
              >
                <span className="pl-4 text-sm text-slate-400">🔍</span>

                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setSearchFocused(false), 150);
                  }}
                  placeholder="Search coupons, stores..."
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  aria-label="Search coupons and stores"
                />

                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* SEARCH RESULTS */}

              {results.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {results.map((item, index) => (
                    <Link
                      key={`${item.slug}-${index}`}
                      href={`/coupons/${item.slug}`}
                      onClick={clearSearch}
                      className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {item.title}
                      </div>

                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {item.store_name || "Store"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* MAIN NAVIGATION */}

            <nav className="ml-auto flex shrink-0 items-center gap-4 text-sm font-medium text-slate-700 lg:gap-5">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap transition-colors hover:text-emerald-600"
                >
                  {item.label}
                </Link>
              ))}

              <SavedLink />
            </nav>
          </div>
        </div>

        {/* SECONDARY NAVIGATION */}

        <div className="border-t border-slate-100 bg-slate-50/60">
          <nav className="mx-auto flex w-full max-w-6xl items-center gap-x-7 overflow-x-auto px-4 py-2.5 text-xs font-medium text-slate-600 lg:px-6 lg:text-sm">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 whitespace-nowrap transition-colors hover:text-emerald-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* =====================================================
            MOBILE HEADER
        ====================================================== */}

      <div className="md:hidden">
        {/* TOP ROW */}

        <div className="flex h-16 items-center justify-between px-4">
          {/* LOGO */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="DealPilot Home"
            className="shrink-0"
          >
            <span className="text-[21px] font-extrabold tracking-tight text-slate-900">
              Deal<span className="text-emerald-500">Pilot</span>
            </span>
          </Link>

          {/* MOBILE ACTIONS */}

          <div className="flex items-center gap-2">
            <Link
              href="/saved"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Saved coupons"
            >
              ♡
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 shadow-sm"
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
            className={`flex h-11 items-center rounded-full border bg-white transition ${
              searchFocused
                ? "border-emerald-500 ring-2 ring-emerald-500/10"
                : "border-slate-300"
            }`}
          >
            <span className="pl-4 text-sm text-slate-400">🔍</span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setSearchFocused(false), 150);
              }}
              placeholder="Search coupons, stores..."
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="Search coupons and stores"
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-slate-400 hover:bg-slate-100"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* MOBILE SEARCH RESULTS */}

          {results.length > 0 && (
            <div className="relative z-50">
              <div className="absolute left-0 right-0 top-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {results.map((item, index) => (
                  <Link
                    key={`${item.slug}-${index}`}
                    href={`/coupons/${item.slug}`}
                    onClick={clearSearch}
                    className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {item.title}
                    </div>

                    <div className="mt-0.5 truncate text-xs text-slate-500">
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
          <div className="border-t border-slate-200 bg-white shadow-lg">
            <nav className="px-4 py-3">
              {/* MAIN LINKS */}

              <div className="grid grid-cols-2 gap-2">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/saved"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  ♡ Saved
                </Link>
              </div>

              {/* SECONDARY LINKS */}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Explore
                </p>

                <div className="flex flex-col">
                  {secondaryNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="rounded-lg px-2 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-emerald-600"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
