"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClientClientClient";

type SearchResult = {
  title: string;
  slug: string;
  store_name: string;
};

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      const { data } = await supabase
        .from("coupons")
        .select("title, slug, store_name")
        .or(`title.ilike.%${query}%,store_name.ilike.%${query}%`)
        .limit(5);

      setResults(data || []);
    };

    const timer = setTimeout(fetchResults, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="bg-white relative flex flex-col border-b">
      {/* TẦNG 1: Logo, Khung tìm kiếm, Menu chính và Sign In */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-bold">
              Deal<span className="text-green-500">Pilot</span>
            </h1>
          </Link>

          {/* Khung tìm kiếm tích hợp logic autocomplete */}
          <div className="flex-1 max-w-lg relative hidden md:block mx-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coupons, stores..."
              className="w-full border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />

            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
                {results.map((item, index) => (
                  <Link
                    key={`${item.slug}-${index}`}
                    href={`/coupons/${item.slug}`}
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                    className="block px-4 py-3 hover:bg-gray-50 border-b last:border-none"
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.store_name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Thanh điều hướng chính & Sign In */}
          <div className="flex items-center gap-6 shrink-0">
            <nav className="hidden md:flex items-center gap-6 font-medium">
              <Link
                href="/stores"
                className="hover:text-green-600 transition-colors"
              >
                Stores
              </Link>
              <Link
                href="/coupons"
                className="hover:text-green-600 transition-colors"
              >
                Coupons
              </Link>
              <Link
                href="/deals"
                className="hover:text-green-600 transition-colors"
              >
                Deals
              </Link>
              <Link
                href="/categories"
                className="hover:text-green-600 transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/blog"
                className="hover:text-green-600 transition-colors"
              >
                Blog
              </Link>
            </nav>
            <div className="hidden md:block w-px h-6 bg-gray-300 mx-2"></div>
            <Link
              href="/login"
              className="font-medium hover:text-green-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* TẦNG 2: Thanh danh mục bên dưới (Đã sắp xếp đúng thứ tự yêu cầu) */}
      <div className="bg-gray-50/50 hidden md:block">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-medium text-gray-600">
          <Link
            href="/trending"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            🔥 Trending Now
          </Link>
          <Link
            href="/top-brands"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            💎 Top Brands
          </Link>
          <Link
            href="/promo-codes"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
          >
            🏷️ Promo Codes
          </Link>
          <Link
            href="/categories/school-supplies"
            className="hover:text-green-600 transition-colors"
          >
            School Supplies
          </Link>
          <Link
            href="/deals/50-off"
            className="hover:text-green-600 transition-colors"
          >
            Over 50% Off
          </Link>
          <Link
            href="/categories/furniture"
            className="hover:text-green-600 transition-colors"
          >
            Furniture
          </Link>
          <Link
            href="/categories/beauty"
            className="hover:text-green-600 transition-colors"
          >
            Beauty
          </Link>
          <Link
            href="/categories/household"
            className="hover:text-green-600 transition-colors"
          >
            Household
          </Link>
        </nav>
      </div>
    </header>
  );
}
