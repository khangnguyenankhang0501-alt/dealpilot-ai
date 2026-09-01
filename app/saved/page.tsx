"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CouponCard from "@/components/CouponCard";
import { getDealPilotSessionId } from "@/lib/session";
import type { Coupon } from "@/types/coupon";

export default function SavedPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedCoupons() {
      try {
        const sessionId = getDealPilotSessionId();

        if (!sessionId) {
          setCoupons([]);
          return;
        }

        const response = await fetch(
          `/api/favorites?sessionId=${encodeURIComponent(sessionId)}`,
        );

        const result = await response.json();

        if (!result.success) {
          setCoupons([]);
          return;
        }

        const savedCoupons: Coupon[] = Array.isArray(result.coupons)
          ? result.coupons
          : [];

        setCoupons(savedCoupons);
      } catch (error) {
        console.error("Failed to load saved coupons:", error);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }

    loadSavedCoupons();
  }, []);

  const handleFavoriteChange = (couponId: string, saved: boolean) => {
    if (!saved) {
      setCoupons((current) =>
        current.filter((coupon) => String(coupon.id) !== couponId),
      );
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-black">
          ← Back to Home
        </Link>
      </div>

      <h1 className="mt-3 text-4xl font-bold">Saved Coupons</h1>

      <p className="mt-2 text-gray-500">Your favorite coupons and deals.</p>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading saved coupons...
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onFavoriteChange={(saved) =>
                handleFavoriteChange(String(coupon.id), saved)
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center mt-8">
          <div className="text-5xl mb-4">♡</div>
          <h2 className="mt-4 text-xl font-bold">No saved coupons yet</h2>

          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Save a coupon by clicking the heart icon.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            Browse Coupons
          </Link>
        </div>
      )}
    </main>
  );
}
