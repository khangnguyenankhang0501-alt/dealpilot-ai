import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const couponId = String(body.couponId || "");
    const sessionId = String(body.sessionId || "");

    if (!couponId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing couponId or sessionId",
        },
        { status: 400 },
      );
    }

    // Kiểm tra coupon có tồn tại
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("id", couponId)
      .maybeSingle();

    if (couponError) {
      return NextResponse.json(
        {
          success: false,
          message: couponError.message,
        },
        { status: 500 },
      );
    }

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    // Kiểm tra favorite hiện tại
    const { data: existing, error: findError } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("coupon_id", couponId)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        {
          success: false,
          message: findError.message,
        },
        { status: 500 },
      );
    }

    // Đã lưu -> bỏ lưu
    if (existing) {
      const { error: deleteError } = await supabaseAdmin
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        return NextResponse.json(
          {
            success: false,
            message: deleteError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        saved: false,
      });
    }

    // Chưa lưu -> lưu
    const { error: insertError } = await supabaseAdmin
      .from("favorites")
      .insert({
        coupon_id: couponId,
        session_id: sessionId,
      });

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: insertError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      saved: true,
    });
  } catch (error) {
    console.error("Favorite API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
