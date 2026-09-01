import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId" },
        { status: 400 },
      );
    }

    // 1. Lấy danh sách favorite của sessionId
    const { data: favorites, error: favError } = await supabaseAdmin
      .from("favorites")
      .select("coupon_id")
      .eq("session_id", sessionId);

    if (favError) {
      throw favError;
    }

    if (!favorites || favorites.length === 0) {
      return NextResponse.json({ success: true, coupons: [] });
    }

    const couponIds = favorites.map((f) => f.coupon_id);

    // 2. Lấy danh sách coupons tương ứng (Chỉ định rõ foreign key relation để tránh lỗi Supabase)
    const { data: coupons, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("*, stores!coupons_store_id_fkey(*)")
      .in("id", couponIds);

    if (couponError) {
      // Nếu không dùng constraint name, fallback về query chuẩn
      const { data: fallbackCoupons, error: fallbackError } =
        await supabaseAdmin
          .from("coupons")
          .select("*, stores(*)")
          .in("id", couponIds);

      if (fallbackError) throw fallbackError;

      return NextResponse.json({
        success: true,
        coupons: fallbackCoupons || [],
      });
    }

    return NextResponse.json({ success: true, coupons: coupons || [] });
  } catch (error: any) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
