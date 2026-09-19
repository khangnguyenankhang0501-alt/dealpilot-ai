"use client";

import { useEffect, useState } from "react";
import { getDealPilotSessionId } from "@/lib/session";

interface FavoriteButtonProps {
  couponId: string;
  onChange?: (saved: boolean) => void;
}

export default function FavoriteButton({
  couponId,
  onChange,
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(
      localStorage.getItem("dealpilot_favorites") || "[]",
    );

    setSaved(favorites.includes(String(couponId)));
  }, [couponId]);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const sessionId = getDealPilotSessionId();

      const response = await fetch("/api/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponId: String(couponId),
          sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Favorite failed");
      }

      const id = String(couponId);

      const favorites = JSON.parse(
        localStorage.getItem("dealpilot_favorites") || "[]",
      );

      let updatedFavorites: string[];

      if (result.saved) {
        updatedFavorites = favorites.includes(id)
          ? favorites
          : [...favorites, id];

        setSaved(true);
        onChange?.(true);

        window.dispatchEvent(new Event("dealpilot-favorites-changed"));
      } else {
        updatedFavorites = favorites.filter((item: string) => item !== id);

        setSaved(false);
        onChange?.(false);

        window.dispatchEvent(new Event("dealpilot-favorites-changed"));
      }

      localStorage.setItem(
        "dealpilot_favorites",
        JSON.stringify(updatedFavorites),
      );
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? "Remove from favorites" : "Save coupon"}
      className="
        absolute
        right-2
        top-2
        z-30
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        bg-transparent
        p-0
        transition-transform
        duration-200
        hover:scale-110
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {saved ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="
            block
            h-[18px]
            w-[18px]
            shrink-0
            text-black
          "
          aria-hidden="true"
        >
          <path
            d="
              M20.84 8.61
              c0 5.2-8.84 10.39-8.84 10.39
              S3.16 13.81 3.16 8.61
              C3.16 5.63 5.31 3.5 8.17 3.5
              c1.72 0 3.3 0.81 3.83 2.18
              C12.53 4.31 14.11 3.5 15.83 3.5
              c2.86 0 5.01 2.13 5.01 5.11Z
            "
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="
            block
            h-[18px]
            w-[18px]
            shrink-0
            text-slate-500
          "
          aria-hidden="true"
        >
          <path
            d="
              M20.84 8.61
              c0 5.2-8.84 10.39-8.84 10.39
              S3.16 13.81 3.16 8.61
              C3.16 5.63 5.31 3.5 8.17 3.5
              c1.72 0 3.3 0.81 3.83 2.18
              C12.53 4.31 14.11 3.5 15.83 3.5
              c2.86 0 5.01 2.13 5.01 5.11Z
            "
          />
        </svg>
      )}
    </button>
  );
}
