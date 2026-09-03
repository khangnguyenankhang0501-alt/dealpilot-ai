import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sessionId = String(body.sessionId || "");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing sessionId",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not signed in",
        },
        { status: 401 },
      );
    }

    // Lấy toàn bộ favorites cũ của browser
    const { data: sessionFavorites, error: sessionError } = await supabaseAdmin
      .from("favorites")
      .select("id, coupon_id, created_at")
      .eq("session_id", sessionId);

    if (sessionError) {
      return NextResponse.json(
        {
          success: false,
          message: sessionError.message,
        },
        { status: 500 },
      );
    }

    if (!sessionFavorites || sessionFavorites.length === 0) {
      return NextResponse.json({
        success: true,
        migrated: 0,
      });
    }

    // Favorites account hiện tại
    const { data: userFavorites } = await supabaseAdmin
      .from("favorites")
      .select("coupon_id")
      .eq("user_id", user.id);

    const existingIds = new Set(
      (userFavorites || []).map((item) => String(item.coupon_id)),
    );

    let migrated = 0;

    for (const favorite of sessionFavorites) {
      const couponId = String(favorite.coupon_id);

      // Nếu account chưa có coupon này → thêm
      if (!existingIds.has(couponId)) {
        const { error: insertError } = await supabaseAdmin
          .from("favorites")
          .insert({
            coupon_id: favorite.coupon_id,
            user_id: user.id,
            created_at: favorite.created_at,
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

        existingIds.add(couponId);
        migrated++;
      }

      // Xóa bản session cũ
      await supabaseAdmin.from("favorites").delete().eq("id", favorite.id);
    }

    return NextResponse.json({
      success: true,
      migrated,
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
