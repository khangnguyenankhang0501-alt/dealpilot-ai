import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const couponId = String(body.couponId || "");
    const sessionId = String(body.sessionId || "");

    if (!couponId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing couponId",
        },
        { status: 400 },
      );
    }

    // Xác định user đang đăng nhập
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Kiểm tra coupon
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("id", couponId)
      .maybeSingle();

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    // ==========================================
    // USER ĐÃ ĐĂNG NHẬP
    // ==========================================
    if (user) {
      const { data: existing, error: findError } = await supabaseAdmin
        .from("favorites")
        .select("id")
        .eq("coupon_id", couponId)
        .eq("user_id", user.id)
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

      // Đã lưu → bỏ lưu
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

      // Chưa lưu → lưu theo user_id
      const { error: insertError } = await supabaseAdmin
        .from("favorites")
        .insert({
          coupon_id: couponId,
          user_id: user.id,
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
    }

    // ==========================================
    // USER CHƯA ĐĂNG NHẬP
    // ==========================================
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing sessionId",
        },
        { status: 400 },
      );
    }

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

    // Đã lưu → bỏ lưu
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

    // Chưa lưu → lưu theo session
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
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
