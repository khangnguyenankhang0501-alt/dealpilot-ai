import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const sessionId = url.searchParams.get("sessionId");

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let favoritesQuery = supabaseAdmin
      .from("favorites")
      .select("coupon_id, created_at");

    // User đã đăng nhập
    if (user) {
      favoritesQuery = favoritesQuery.eq("user_id", user.id);
    }

    // Guest
    else {
      if (!sessionId) {
        return NextResponse.json({
          success: true,
          coupons: [],
        });
      }

      favoritesQuery = favoritesQuery.eq("session_id", sessionId);
    }

    const { data: favorites, error: favoritesError } =
      await favoritesQuery.order("created_at", {
        ascending: false,
      });

    if (favoritesError) {
      return NextResponse.json(
        {
          success: false,
          message: favoritesError.message,
        },
        { status: 500 },
      );
    }

    if (!favorites || favorites.length === 0) {
      return NextResponse.json({
        success: true,
        coupons: [],
      });
    }

    const couponIds = favorites.map((item) => item.coupon_id);

    // QUAN TRỌNG:
    // Chưa embed stores ở đây.
    const { data: coupons, error: couponsError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .in("id", couponIds);

    if (couponsError) {
      return NextResponse.json(
        {
          success: false,
          message: couponsError.message,
        },
        { status: 500 },
      );
    }

    if (!coupons || coupons.length === 0) {
      return NextResponse.json({
        success: true,
        coupons: [],
      });
    }

    // Lấy store_id của các coupon
    const storeIds = [
      ...new Set(coupons.map((coupon) => coupon.store_id).filter(Boolean)),
    ];

    let stores: any[] = [];

    if (storeIds.length > 0) {
      const { data: storeData, error: storesError } = await supabaseAdmin
        .from("stores")
        .select("id, name, slug, logo_url")
        .in("id", storeIds);

      if (storesError) {
        return NextResponse.json(
          {
            success: false,
            message: storesError.message,
          },
          { status: 500 },
        );
      }

      stores = storeData || [];
    }

    const storeMap = new Map(stores.map((store) => [String(store.id), store]));

    const couponMap = new Map(
      coupons.map((coupon) => {
        const store = coupon.store_id
          ? storeMap.get(String(coupon.store_id)) || null
          : null;

        return [
          String(coupon.id),
          {
            ...coupon,
            stores: store,
          },
        ];
      }),
    );

    const orderedCoupons = couponIds
      .map((id) => couponMap.get(String(id)))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      coupons: orderedCoupons,
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
