import { supabase } from "@/lib/supabase-temp";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 });
  }

  // Lấy số lượt click hiện tại của coupon
  const { data: coupon, error: fetchError } = await supabase
    .from("coupons")
    .select("clicks")
    .eq("id", id)
    .single();

  if (fetchError || !coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  const currentClicks = coupon.clicks || 0;

  // Cập nhật tăng thêm 1 lượt click
  const { error: updateError } = await supabase
    .from("coupons")
    .update({ clicks: currentClicks + 1 })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, clicks: currentClicks + 1 });
}
