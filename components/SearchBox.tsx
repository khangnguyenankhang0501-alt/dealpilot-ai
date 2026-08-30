"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchBox({ coupons }: { coupons: any[] }) {
  const [query, setQuery] = useState("");

  const suggestions = coupons.filter(
    (coupon) =>
      coupon.title?.toLowerCase().includes(query.toLowerCase()) ||
      coupon.store_name?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search coupons..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-3 w-full rounded"
      />

      {query && (
        <div className="absolute bg-white border w-full mt-1 rounded shadow-lg z-50">
          {suggestions.slice(0, 5).map((coupon) => (
            <Link
              key={coupon.id}
              href={`/coupon/${coupon.slug}`}
              className="block px-4 py-3 hover:bg-gray-100"
            >
              <div className="font-semibold">{coupon.title}</div>

              <div className="text-sm text-gray-500">{coupon.store_name}</div>
            </Link>
          ))}

          {suggestions.length === 0 && (
            <div className="px-4 py-3 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
