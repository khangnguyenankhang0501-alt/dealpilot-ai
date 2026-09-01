"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type SearchResult = {
  id: string;
  title: string | null;
  slug: string | null;
  store_name: string | null;
  coupon_code: string | null;
};

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = query.trim();

    if (!search) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("coupons")
          .select("id, title, slug, store_name, coupon_code")
          .eq("status", "Active")
          .or(`expires_at.is.null,expires_at.gte.${today}`)
          .or(
            `title.ilike.%${search}%,store_name.ilike.%${search}%,coupon_code.ilike.%${search}%`,
          )
          .limit(5);

        if (error) {
          console.error("Search error:", error);
          setResults([]);
          return;
        }

        setResults(data ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="relative mb-6 w-full">
      <input
        type="text"
        placeholder="Search coupons..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border p-3 outline-none focus:border-black"
      />

      {hasQuery && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg">
          {loading && (
            <div className="px-4 py-3 text-gray-500">Searching...</div>
          )}

          {!loading &&
            results.length > 0 &&
            results.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/coupons/${item.slug}` : "#"}
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="block border-b px-4 py-3 hover:bg-gray-100 last:border-b-0"
              >
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-500">{item.store_name}</div>

                {item.coupon_code && (
                  <div className="mt-1 text-xs font-semibold text-green-600">
                    Code: {item.coupon_code}
                  </div>
                )}
              </Link>
            ))}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
