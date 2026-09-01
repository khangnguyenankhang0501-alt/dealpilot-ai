"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDealPilotSessionId } from "@/lib/session";

export default function SavedLink() {
  const [count, setCount] = useState<number>(0);

  const loadCount = () => {
    try {
      const favorites = JSON.parse(
        localStorage.getItem("dealpilot_favorites") || "[]",
      );
      setCount(favorites.length);
    } catch (error) {
      console.error("Error reading favorites count:", error);
      setCount(0);
    }
  };

  useEffect(() => {
    // 1. Tải số lượng ban đầu khi component mount
    loadCount();

    // 2. Lắng nghe sự kiện storage (thay đổi từ tab khác)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dealpilot_favorites") {
        loadCount();
      }
    };

    // 3. Lắng nghe custom event khi bấm nút tim ở tab hiện tại
    const handleFavoritesChanged = () => {
      loadCount();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "dealpilot-favorites-changed",
      handleFavoritesChanged,
    );

    // Cleanup listeners khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "dealpilot-favorites-changed",
        handleFavoritesChanged,
      );
    };
  }, []);

  return (
    <Link
      href="/saved"
      className="flex items-center gap-1.5 font-medium hover:text-green-600 transition-colors"
    >
      <span>♡</span>
      <span>Saved</span>
      {count > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-600 px-1.5 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
