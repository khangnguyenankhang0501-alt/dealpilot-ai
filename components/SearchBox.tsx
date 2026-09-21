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

  image_url: string | null;
  sale_price: number | string | null;
  original_price: number | string | null;
  discount_value: number | string | null;
};

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
          .select(
            `
              id,
              title,
              slug,
              store_name,
              coupon_code,
              image_url,
              sale_price,
              original_price,
              discount_value
            `,
          )
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

        setResults((data ?? []) as SearchResult[]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="relative mb-6 w-full">
      {/* SEARCH INPUT */}
      <div className="relative">
        <span
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        >
          🔍
        </span>

        <input
          type="text"
          placeholder="Search for a store, product or brand..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            h-14
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            pl-11
            pr-12
            text-sm
            font-medium
            text-slate-900
            shadow-sm
            outline-none
            transition
            focus:border-emerald-400
            focus:ring-4
            focus:ring-emerald-100
          "
        />

        {hasQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="
              absolute
              right-3
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            ×
          </button>
        )}
      </div>

      {/* SEARCH DROPDOWN */}
      {hasQuery && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_50px_rgba(15,23,42,0.14)]
          "
        >
          {/* LOADING */}
          {loading && (
            <div className="px-5 py-5 text-sm font-medium text-slate-500">
              Searching...
            </div>
          )}

          {/* RESULTS */}
          {!loading &&
            results.length > 0 &&
            results.map((item) => {
              const salePrice = formatPrice(item.sale_price);

              const originalPrice = formatPrice(item.original_price);

              const discount = formatDiscount(item.discount_value);

              return (
                <Link
                  key={item.id}
                  href={
                    item.slug
                      ? `/coupons/${encodeURIComponent(item.slug)}`
                      : "#"
                  }
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
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
                    transition
                    last:border-b-0
                    hover:bg-slate-50
                  "
                >
                  {/* PRODUCT IMAGE */}
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

                    <div className="mt-1 flex items-center gap-2">
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

          {/* EMPTY */}
          {!loading && results.length === 0 && (
            <div className="px-5 py-5 text-sm font-medium text-slate-500">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}
