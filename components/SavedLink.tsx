"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getDealPilotSessionId } from "@/lib/session";

export default function SavedLink() {
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const sessionId = getDealPilotSessionId();

      const response = await fetch(
        `/api/favorites?sessionId=${encodeURIComponent(sessionId)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setCount(0);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        setCount(0);
        return;
      }

      const coupons = Array.isArray(result.coupons) ? result.coupons : [];

      setCount(coupons.length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    // Load lần đầu
    loadCount();

    // Khi FavoriteButton thay đổi
    const handleFavoritesChanged = () => {
      loadCount();
    };

    // Khi quay lại tab / trang
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCount();
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
  }, [loadCount]);

  return (
    <Link
      href="/saved"
      className="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-black"
    >
      <span className="text-lg">{count > 0 ? "♥" : "♡"}</span>

      <span>
        Saved
        {count > 0 && ` ${count}`}
      </span>
    </Link>
  );
}
