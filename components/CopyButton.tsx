"use client";

import { useState } from "react";

interface CopyButtonProps {
  id: string | number;
  code: string;
  affiliateUrl?: string;
}

export default function CopyButton({
  id,
  code,
  affiliateUrl,
}: CopyButtonProps) {
  const [revealed, setRevealed] = useState(false);

  const handleClick = async () => {
    // 1. Copy mã giảm giá vào clipboard
    navigator.clipboard.writeText(code);

    // 2. Đổi trạng thái hiển thị code thật
    setRevealed(true);

    // 3. Gọi API tăng lượt click
    try {
      await fetch(`/api/coupon-click/${id}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to update click count", error);
    }

    // 4. Mở link affiliate ở tab mới nếu có
    if (affiliateUrl) {
      window.open(affiliateUrl, "_blank");
    }
  };

  const maskedCode = code ? code.slice(0, 3) + "•••" : "SAV•••";

  return (
    <div className="flex overflow-hidden rounded-lg border shadow-sm w-fit my-6">
      <div className="bg-green-50 px-8 py-4 text-3xl font-bold text-green-700 tracking-wider flex items-center">
        {revealed ? code : maskedCode}
      </div>

      <button
        onClick={handleClick}
        className="bg-green-500 hover:bg-green-600 text-white px-6 font-bold cursor-pointer transition"
      >
        GET CODE
      </button>
    </div>
  );
}
