import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const { data: coupon, error: fetchError } = await supabase
      .from("coupons")
      .select("click_count")
      .eq("id", id)
      .single();

    if (fetchError || !coupon) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const currentCount = Number(coupon.click_count) || 0;

    const { error: updateError } = await supabase
      .from("coupons")
      .update({
        click_count: currentCount + 1,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      click_count: currentCount + 1,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
