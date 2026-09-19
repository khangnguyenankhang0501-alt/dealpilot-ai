"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import CouponCard from "@/components/CouponCard";
import { getDealPilotSessionId } from "@/lib/session";
import { Coupon } from "@/types/coupon";

export default function SavedPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);

      const sessionId = getDealPilotSessionId();

      const response = await fetch(
        `/api/favorites?sessionId=${encodeURIComponent(sessionId)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setCoupons([]);
        return;
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.coupons)) {
        setCoupons([]);
        return;
      }

      setCoupons(result.coupons as Coupon[]);
    } catch (error) {
      console.error("Load favorites error:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    const handleFavoritesChanged = () => {
      loadFavorites();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadFavorites();
      }
    };

    window.addEventListener(
      "dealpilot-favorites-changed",
      handleFavoritesChanged,
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(
        "dealpilot-favorites-changed",
        handleFavoritesChanged,
      );

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadFavorites]);

  const handleFavoriteChange = (couponId: string, saved: boolean) => {
    if (!saved) {
      setCoupons((current) =>
        current.filter((coupon) => String(coupon.id) !== String(couponId)),
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* HEADER */}
        <div className="mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-600">
                Your saved deals
              </div>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Saved
              </h1>

              {!loading && coupons.length > 0 && (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {coupons.length} {coupons.length === 1 ? "deal" : "deals"}{" "}
                  saved
                </p>
              )}
            </div>

            <Link
              href="/coupons"
              className="
                inline-flex
                w-fit
                items-center
                justify-center
                rounded-xl
                bg-slate-950
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-slate-800
              "
            >
              Browse coupons
            </Link>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="
                  min-h-[345px]
                  animate-pulse
                  rounded-[20px]
                  border
                  border-slate-200
                  bg-white
                "
              >
                <div className="h-[175px] rounded-t-[20px] bg-slate-200" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                  <div className="h-4 w-3/5 rounded bg-slate-200" />
                  <div className="h-6 w-24 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && coupons.length === 0 && (
          <section
            className="
              flex
              min-h-[420px]
              items-center
              justify-center
              rounded-[24px]
              border
              border-slate-200
              bg-white
              px-6
              py-16
              text-center
            "
          >
            <div className="max-w-md">
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-50
                  text-3xl
                "
              >
                ♡
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                No saved deals yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save deals you want to come back to by tapping the heart on any
                coupon card.
              </p>

              <Link
                href="/coupons"
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  transition
                  hover:bg-emerald-600
                "
              >
                Explore coupons
              </Link>
            </div>
          </section>
        )}

        {/* SAVED COUPONS */}
        {!loading && coupons.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {coupons.map((coupon) => (
              <CouponCard
                key={String(coupon.id)}
                coupon={coupon}
                onFavoriteChange={(saved) =>
                  handleFavoriteChange(String(coupon.id), saved)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
