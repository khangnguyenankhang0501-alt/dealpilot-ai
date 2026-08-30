import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server action để xử lý xóa coupon
async function deleteCoupon(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (!id) return;

  await supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Khu vực chứa các nút chức năng */}
        <div className="flex items-center space-x-3">
          {/* Nút View Stats đã được thêm vào đây */}
          <Link
            href="/admin/stats"
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium flex items-center gap-2"
          >
            📊 View Stats
          </Link>
          <Link
            href="/admin/import"
            className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            📥 Import CSV
          </Link>
          <Link
            href="/admin/new"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
          >
            + Add New Coupon
          </Link>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Store</th>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold text-center">Clicks</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">{coupon.title}</td>
                <td className="p-4 text-gray-600">{coupon.store_name}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-mono text-sm">
                    {coupon.code || "N/A"}
                  </span>
                </td>
                <td className="p-4 text-center font-bold text-blue-600">
                  {coupon.clicks || 0}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link
                    href={`/admin/edit/${coupon.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <form action={deleteCoupon} className="inline-block">
                    <input type="hidden" name="id" value={coupon.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:underline font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
