import { supabase } from "@/lib/supabaseClient";
import CouponCard from "@/components/CouponCard";

// Tắt cache để danh sách luôn cập nhật mới nhất
export const revalidate = 0;

export const metadata = {
  title: "All Coupons & Promo Codes | DealPilot",
  description:
    "Discover the latest working promo codes, discounts, and offers. Save big today!",
};

export default async function AllCouponsPage() {
  // Lấy toàn bộ danh sách coupons từ Supabase (mới nhất xếp trước)
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">All Coupons & Deals</h1>
        <p className="text-gray-600 text-lg">
          Browse our full collection of verified discounts and promo codes.
        </p>
      </div>

      {/* Danh sách CouponCard chung */}
      {coupons && coupons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-gray-50 p-10 rounded-xl border border-dashed text-gray-500">
          No coupons available at the moment. Please check back later!
        </div>
      )}
    </main>
  );
}
