"use server";

import { supabase } from "@/lib/supabaseClientClient";
import { revalidatePath } from "next/cache";

export async function trackClick(couponId: string | number) {
  if (!couponId) return;

  // 1. Thêm lượt click mới vào database (Chạy trên server nên không bị chặn)
  const { error } = await supabase.from("clicks").insert({
    coupon_id: couponId,
  });

  if (error) {
    console.error("Lỗi khi insert click:", error);
    return;
  }

  // 2. Xóa cache của các trang này để chúng cập nhật số liệu ngay lập tức
  revalidatePath("/");
  revalidatePath("/promo-codes");
  revalidatePath("/admin/stats");
}
