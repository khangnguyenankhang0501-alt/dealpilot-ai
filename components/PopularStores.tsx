import Link from "next/link";
import { supabase } from "@/lib/supabase-temp";

export const revalidate = 0;

export default async function PopularStores() {
  // Lấy các thương hiệu có lượt click cao nhất
  let { data: stores } = await supabase
    .from("stores")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(4);

  // Fallback nếu chưa có dữ liệu clicks
  if (!stores || stores.length === 0) {
    const { data: fallback } = await supabase
      .from("stores")
      .select("*")
      .limit(4);
    stores = fallback;
  }

  if (!stores || stores.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🏷️ Most Popular Stores
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.slug || store.name?.toLowerCase().replace(/\s+/g, "-")}`}
            className="border rounded-2xl p-5 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition text-center"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 mb-3">
              {store.name?.charAt(0)}
            </div>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {store.name}
            </h3>
            <span className="text-xs text-gray-400 mt-1">
              🔥 {store.clicks || 0} clicks
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
