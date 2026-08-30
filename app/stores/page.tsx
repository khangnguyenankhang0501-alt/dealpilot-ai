import { supabase } from "@/lib/supabaseClientClientClient";
import Link from "next/link";

export default async function StoresPage() {
  // Lấy danh sách tất cả các coupon để lọc ra tên các store duy nhất
  const { data: coupons } = await supabase.from("coupons").select("store_name");

  // Lọc ra danh sách store không bị trùng lặp
  const stores = Array.from(
    new Set(coupons?.map((coupon) => coupon.store_name).filter(Boolean)),
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">Top Stores</h1>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stores.map((store, index) => (
          <Link
            key={index}
            href={`/stores/${store?.toLowerCase()}`}
            className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition text-center font-semibold text-lg"
          >
            {store}
          </Link>
        ))}
      </div>
    </main>
  );
}
