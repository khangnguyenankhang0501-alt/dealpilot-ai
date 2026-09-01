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

  // Kiểm tra trạng thái đã lưu khi component được tải
  useEffect(() => {
    const sessionId = getDealPilotSessionId();
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

        // Phát sự kiện để báo cho Header (SavedLink) cập nhật số lượng
        window.dispatchEvent(new Event("dealpilot-favorites-changed"));
      } else {
        updatedFavorites = favorites.filter((item: string) => item !== id);

        setSaved(false);
        onChange?.(false);

        // Phát sự kiện để báo cho Header (SavedLink) cập nhật số lượng
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
      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-105 hover:bg-gray-50 disabled:opacity-50"
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
