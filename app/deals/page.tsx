import { supabase } from "@/lib/supabaseClient";
import { Metadata } from "next";
import CouponCard from "@/components/CouponCard"; // Import CouponCard đồng bộ

export const metadata: Metadata = {
  title: "Over 50% Off Deals | DealPilot",
  description: "Discover amazing deals with 50% off or more.",
};

export const revalidate = 0;

export default async function DealsPage() {
  // Vì lấy từ bảng "coupons" nên hoàn toàn tương thích với component CouponCard
  const { data: deals } = await supabase.from("coupons").select("*");

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">Over 50% Off</h1>

      <p className="text-gray-600 mb-10 text-lg">
        Discover amazing deals with 50% off or more.
      </p>

      {!deals || deals.length === 0 ? (
        <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed text-center">
          There are currently no deals over 50% off.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <CouponCard key={deal.id} coupon={deal} />
          ))}
        </div>
      )}
    </main>
  );
}
